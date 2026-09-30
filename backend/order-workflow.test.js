import test from "node:test";
import assert from "node:assert/strict";
import { allowedTransitions, validateTransition, containsPrescription } from "../lib/order-workflow.js";
import { buildOrderEmail } from "./order-emails.js";

test("regular and prescription lifecycle rules, including terminal states", () => {
  assert.deepEqual(allowedTransitions("Unfulfilled"), ["Processing", "Cancelled"]);
  assert.deepEqual(allowedTransitions("Processing"), ["Dispatched", "Cancelled"]);
  assert.deepEqual(allowedTransitions("Processing", true), ["Dispatched", "Returned"]);
  assert.deepEqual(allowedTransitions("Dispatched"), ["Delivered", "Returned"]);
  assert.deepEqual(allowedTransitions("Delivered"), ["Returned"]);
  for (const state of ["Returned", "Cancelled"]) assert.deepEqual(allowedTransitions(state), []);
  assert.ok(validateTransition("Unfulfilled", "Delivered", false));
  assert.ok(validateTransition("Processing", "Cancelled", true, { reason: "Other" }));
  assert.ok(validateTransition("Dispatched", "Cancelled", false, { reason: "Other" }));
  assert.equal(validateTransition("Processing", "Returned", true, { reason: "Item defect / warranty claim" }), null);
});
test("status details required and reason choices enforced", () => {
  assert.ok(validateTransition("Processing", "Dispatched", false, {}));
  assert.ok(validateTransition("Processing", "Dispatched", false, { courierName:" ", trackingNumber:"123" }));
  assert.equal(validateTransition("Processing", "Dispatched", false, { courierName:"Courier", trackingNumber:"123" }), null);
  assert.ok(validateTransition("Unfulfilled", "Cancelled", false, { reason:"Invented" }));
  assert.ok(validateTransition("Delivered", "Returned", false));
});
test("prescription detection in mixed and legacy orders", () => {
  assert.equal(containsPrescription([{ lensPrice:6500, vision:"non-prescription" }]), false);
  assert.equal(containsPrescription([{ name:"Regular" }, { prescription:{ right:{sph:"1"} } }]), true);
  assert.equal(containsPrescription([{ prescriptionMethod:"later", vision:"single-vision" }]), true);
  assert.equal(containsPrescription([{ isPrescription:true }]), true);
});
test("all six email templates, links, full name, totals and escaping", () => {
  const order = {customer_name:"Ali Khan",email:"ali@example.test",order_number:"EC-000123",items:[{name:"Frame"}],subtotal:1000,delivery_charge:199,is_prescription:true,courier_name:"Courier",tracking_number:"A & 1",status_reason:"Unreachable"};
  const config = { orderReplyTo:"orders@example.test", prescriptionWindow:"5-7 working days", nonPrescriptionWindow:"1-3 working days", reviewLink:"https://example.test/review", trackingLinkPattern:"https://example.test/track?id={tracking_number}" };
  for (const event of ["Received","Processing","Dispatched","Delivered","Cancelled","Returned"]) {
    const mail = buildOrderEmail(order,event,config);
    assert.match(mail.text,/Hi Ali Khan,/);
    assert.match(mail.html,/Hi Ali Khan,/);
    assert.match(mail.from,/no-reply@eyechamp.pk/);
    assert.equal(mail.replyTo,config.orderReplyTo);
  }
  assert.match(buildOrderEmail(order,"Received",config).text,/Rs 1199.00/);
  assert.match(buildOrderEmail(order,"Processing",config).text,/5-7/);
  assert.match(buildOrderEmail({...order,delivery_window:"Saved window"},"Dispatched",config).text,/Saved window/);
  assert.match(buildOrderEmail(order,"Dispatched",config).html,/A%20%26%201/);
  assert.doesNotMatch(buildOrderEmail(order,"Dispatched",{}).html,/Track your order/);
  assert.doesNotMatch(buildOrderEmail(order,"Delivered",{reviewLink:"javascript:alert(1)"}).html,/javascript:|Leave a review/);
  assert.match(buildOrderEmail(order,"Cancelled",config).text,/unable to reach you/);
  assert.doesNotMatch(buildOrderEmail({...order,customer_name:"<script>"},"Received",config).html,/<script>/);
});

test("emails do not contain corrupted separator punctuation", () => {
  const order = {customer_name:"Ali",email:"test@example.test",order_number:"EC-1",items:[{name:"Frame"}],subtotal:1000,courier_name:"Courier",tracking_number:"123",status_reason:"Unreachable"};
  for (const event of ["Received","Processing","Dispatched","Delivered","Cancelled","Returned"]) {
    const message = buildOrderEmail(order,event,{});
    for (const content of [message.text,message.html]) {
      assert.doesNotMatch(content,/ \? |\? Team Eye Champ|[15]\?[37]/);
    }
  }
  assert.match(buildOrderEmail(order,"Delivered",{}).text,/Got a minute\?/);
  assert.match(buildOrderEmail(order,"Cancelled",{}).text,/cancelled as we were unable/);
});
