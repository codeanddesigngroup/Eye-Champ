import "dotenv/config";
import test from "node:test";
import assert from "node:assert/strict";
import { pool } from "./db.js";
import { ordersRouter } from "./routes/orders.js";
import { queueOrderEmail } from "./order-emails.js";

test("order status API enforces rules and queues each event atomically once", async () => {
  const client = await pool.connect();
  const connect = pool.connect;
  const smtpHost = process.env.SMTP_HOST;
  delete process.env.SMTP_HOST;
  try {
    await client.query("CREATE TEMP TABLE orders (LIKE public.orders INCLUDING ALL)");
    await client.query("CREATE TEMP SEQUENCE order_test_ids");
    await client.query("ALTER TABLE orders ALTER COLUMN id SET DEFAULT nextval('order_test_ids')");
    await client.query("CREATE TEMP TABLE store_settings (key TEXT PRIMARY KEY, value JSONB)");
    await client.query("INSERT INTO store_settings VALUES ('general', '{\"prescriptionWindow\":\"5-7 days\",\"nonPrescriptionWindow\":\"1-3 days\",\"supportEmail\":\"support@example.test\"}')");
    await client.query("CREATE TEMP TABLE order_email_events (id BIGSERIAL,order_id BIGINT,event TEXT,payload JSONB,UNIQUE(order_id,event))");
    pool.connect = async () => ({ query: (...args) => client.query(...args), release() {} });
    const handler = ordersRouter.stack.find(layer => layer.route?.methods.patch).route.stack[0].handle;
    async function create(prescription) {
      const { rows } = await client.query("INSERT INTO orders(customer_name,email,phone,address,city,postal_code,items,subtotal,is_prescription) VALUES('Ali Khan','ali@example.test','123','Test street','Karachi','75300','[]',1000,$1) RETURNING id", [prescription]);
      await client.query("UPDATE orders SET order_number='TEST-'||id WHERE id=$1", [rows[0].id]);
      await queueOrderEmail(client, rows[0].id, "Received");
      return rows[0].id;
    }
    async function patch(id, body) {
      let code=200, result;
      await handler({params:{id:String(id)},body}, { status(value){code=value;return this;},json(value){result=value;} }, error=>{throw error;});
      return {code,...result};
    }
    const regular = await create(false), rx = await create(true);
    assert.equal((await patch(regular,{fulfillment:"Dispatched"})).code,400);
    assert.equal((await patch(regular,{fulfillment:"Processing",expectedFulfillment:"Unfulfilled"})).code,200);
    assert.equal((await patch(regular,{fulfillment:"Processing"})).emailQueued,false);
    assert.equal((await patch(regular,{fulfillment:"Dispatched",courierName:"Courier"})).code,400);
    assert.equal((await patch(regular,{fulfillment:"Dispatched",courierName:"Courier",trackingNumber:"123",expectedFulfillment:"Unfulfilled"})).code,409);
    assert.equal((await patch(regular,{fulfillment:"Dispatched",courierName:"Courier",trackingNumber:"123"})).code,200);
    assert.equal((await patch(regular,{fulfillment:"Cancelled",reason:"Other"})).code,400);
    assert.equal((await patch(regular,{fulfillment:"Delivered"})).code,200);
    assert.equal((await patch(regular,{fulfillment:"Returned",reason:"Wrong item sent"})).code,200);
    assert.equal((await patch(regular,{fulfillment:"Processing"})).code,400);
    assert.equal((await patch(rx,{fulfillment:"Processing"})).code,200);
    assert.equal((await patch(rx,{fulfillment:"Cancelled",reason:"Customer request"})).code,400);
    assert.equal((await patch(rx,{fulfillment:"Returned",reason:"Item defect / warranty claim"})).code,200);
    const events=await client.query("SELECT event FROM order_email_events WHERE order_id=$1 ORDER BY id",[regular]);
    assert.deepEqual(events.rows.map(row=>row.event),["Received","Processing","Dispatched","Delivered","Returned"]);
    const saved=await client.query("SELECT courier_name,tracking_number,status_reason,delivery_window FROM orders WHERE id=$1",[regular]);
    assert.deepEqual(saved.rows[0],{courier_name:"Courier",tracking_number:"123",status_reason:"Wrong item sent",delivery_window:"1-3 days"});
    const queued=await client.query("SELECT payload FROM order_email_events WHERE order_id=$1 AND event='Processing'",[rx]);
    assert.match(queued.rows[0].payload.text,/5-7 days/);
    const rollbackOrder=await create(false);
    pool.connect = async () => ({
      release() {},
      query(sql, values) {
        if (sql.startsWith("INSERT INTO order_email_events")) throw new Error("Simulated queue failure");
        return client.query(sql, values);
      },
    });
    await assert.rejects(patch(rollbackOrder,{fulfillment:"Processing"}),/Simulated queue failure/);
    assert.equal((await client.query("SELECT fulfillment_status FROM orders WHERE id=$1",[rollbackOrder])).rows[0].fulfillment_status,"Unfulfilled");
    pool.connect = async () => ({ query: (...args) => client.query(...args), release() {} });
    const cancelled=await create(true);
    assert.equal((await patch(cancelled,{fulfillment:"Cancelled"})).code,400);
    assert.equal((await patch(cancelled,{fulfillment:"Cancelled",reason:"Unreachable"})).code,200);
    assert.equal((await patch(cancelled,{payment:"Paid"})).emailQueued,false);
  } finally {
    pool.connect=connect;
    if(smtpHost===undefined)delete process.env.SMTP_HOST;else process.env.SMTP_HOST=smtpHost;
    await client.query("DROP TABLE IF EXISTS pg_temp.order_email_events, pg_temp.orders, pg_temp.store_settings");
    await client.query("DROP SEQUENCE IF EXISTS pg_temp.order_test_ids");
    client.release();
    await pool.end();
  }
});
