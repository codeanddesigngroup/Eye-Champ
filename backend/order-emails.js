import { pool } from "./db.js";
import { createMailer } from "./mailer.js";

export const notificationDefaults = {
  orderReplyTo: "", nonPrescriptionWindow: "1-3 working days", prescriptionWindow: "5-7 working days",
  trackingLinkPattern: "", reviewLink: "", orderWhatsapp: "923318099594",
};
const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const safeLink = value => { try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : ""; } catch { return ""; } };
const cancelWords = {"Unreachable":"as we were unable to reach you to confirm the order", "Out of stock":"because an item is out of stock", "Customer request":"at your request", "Other":"following our team's review"};
const returnWords = {"Refused at delivery":"as the parcel was refused at delivery", "Customer requested return":"at your request", "Item defect / warranty claim":"for an item defect or warranty claim", "Wrong item sent":"because the wrong item was sent", "Other":"as delivery or acceptance could not be completed"};

export function buildOrderEmail(order, event, config) {
  const settings = { ...notificationDefaults, ...config };
  const customerName = String(order.customer_name).trim().replace(/\s+/g, " ");
  const number = order.order_number;
  const windowText = order.delivery_window || (order.is_prescription ? settings.prescriptionWindow : settings.nonPrescriptionWindow);
  const phone = String(settings.orderWhatsapp || settings.supportPhone || "").replace(/\D/g, "");
  const whatsapp = phone ? `https://wa.me/${phone}` : "";
  const tracking = safeLink(settings.trackingLinkPattern.replaceAll("{tracking_number}", encodeURIComponent(order.tracking_number || "")));
  const review = safeLink(settings.reviewLink);
  let paragraphs = [], title = "";
  if (event === "Received") {
    title = "Order Received";
    paragraphs = [`Thanks for shopping with Eye Champ! We've received your order ${number} and it's now with our team.`, `Order summary: ${(order.items || []).map(item => item.name).join(", ")} - Rs ${(Number(order.subtotal) + Number(order.delivery_charge || 0)).toFixed(2)}`, "You'll get a confirmation email shortly once our team has reviewed it.", "Questions in the meantime? Message us on WhatsApp - we're happy to help."];
  } else if (event === "Processing") {
    title = "Order Confirmed";
    paragraphs = [`Good news - your order ${number} is confirmed and being prepared.`, `Expected delivery: ${windowText}`, "We'll email you again as soon as it's on its way, with courier and tracking details."];
  } else if (event === "Dispatched") {
    title = "Order Dispatched";
    paragraphs = [`Your order ${number} has been dispatched!`, `Courier: ${order.courier_name}`, `Tracking number: ${order.tracking_number}`, ...(tracking ? [`Track your order: ${tracking}`] : []), "Number not working, or want a hand? Message us on WhatsApp with your order number and we'll check for you.", `Expected delivery: ${windowText}`];
  } else if (event === "Delivered") {
    title = "Order Delivered";
    paragraphs = [`Your order ${number} has been delivered - we hope you're loving it!`, "We're a new brand in Pakistan, and every review helps the next person shop with confidence. Got a minute?", ...(review ? [`Leave a review: ${review}`] : []), "Something wrong with your order? Reach out within 48 hours of delivery and we'll sort it out."];
  } else if (event === "Cancelled") {
    title = "Order Cancelled";
    paragraphs = [`Your order ${number} has been cancelled ${cancelWords[order.status_reason] || "following our team's review"}.`, "If this doesn't look right, message us on WhatsApp and we'll sort it out, or feel free to place a new order anytime."];
  } else if (event === "Returned") {
    title = "Order Returned";
    paragraphs = [`Your order ${number} has been returned to us ${returnWords[order.status_reason] || "following our team's review"}.`, "Our team will follow up with you on WhatsApp shortly to sort out next steps.", "Questions in the meantime? Message us on WhatsApp anytime."];
  } else throw new Error("Unknown order email event");
  const lines = [`Hi ${customerName},`, ...paragraphs, "Team Eye Champ"];
  return {
    from: "Eye Champ <no-reply@eyechamp.pk>", replyTo: settings.orderReplyTo || settings.supportEmail || undefined,
    to: order.email, subject: `${title} | ${number}`,
    text: lines.join("\n\n") + (whatsapp ? `\n\nWhatsApp: ${whatsapp}` : ""),
    html: `<div style="max-width:640px;margin:auto;font-family:Arial,sans-serif;line-height:1.7;color:#202024">${lines.map(line => line.startsWith("Track your order: ") ? `<p><a href="${escape(tracking)}">Track your order</a></p>` : line.startsWith("Leave a review: ") ? `<p><a href="${escape(review)}">Leave a review</a></p>` : `<p>${escape(line)}</p>`).join("")}${whatsapp ? `<p><a href="${whatsapp}">Message us on WhatsApp</a></p>` : ""}</div>`,
  };
}

export async function queueOrderEmail(client, orderId, event) {
  const { rows } = await client.query("SELECT * FROM orders WHERE id=$1", [orderId]);
  const config = await client.query("SELECT value FROM store_settings WHERE key='general'");
  const order = rows[0];
  const settings = { ...notificationDefaults, ...config.rows[0]?.value };
  if (!order.delivery_window && ["Processing", "Dispatched"].includes(event)) {
    order.delivery_window = order.is_prescription ? settings.prescriptionWindow : settings.nonPrescriptionWindow;
    await client.query("UPDATE orders SET delivery_window=$1 WHERE id=$2", [order.delivery_window, orderId]);
  }
  await client.query("INSERT INTO order_email_events(order_id,event,payload) VALUES($1,$2,$3::jsonb) ON CONFLICT(order_id,event) DO NOTHING", [orderId, event, JSON.stringify(buildOrderEmail(order, event, settings))]);
}

let running = false;
export async function deliverOrderEmails() {
  if (running) return;
  const mailer = createMailer();
  if (!mailer) return;
  running = true;
  try {
    for (let i = 0; i < 20; i++) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const { rows } = await client.query("SELECT * FROM order_email_events WHERE sent_at IS NULL AND next_attempt_at<=NOW() ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED");
        if (!rows[0]) { await client.query("COMMIT"); break; }
        const job = rows[0];
        try {
          await mailer.sendMail({ ...job.payload, messageId: `<order-event-${job.id}@eyechamp.pk>` });
          await client.query("UPDATE order_email_events SET sent_at=NOW(),attempts=attempts+1,last_error=NULL WHERE id=$1", [job.id]);
        } catch (error) {
          await client.query("UPDATE order_email_events SET attempts=attempts+1,last_error=$2,next_attempt_at=NOW()+INTERVAL '5 minutes' WHERE id=$1", [job.id, String(error.message).slice(0,500)]);
        }
        await client.query("COMMIT");
      } catch (error) { await client.query("ROLLBACK"); console.error("Order email queue error", error); }
      finally { client.release(); }
    }
  } finally { running = false; }
}
