import test from "node:test";
import assert from "node:assert/strict";
import nodemailer from "nodemailer";
import { pool } from "./db.js";
import { deliverOrderEmails } from "./order-emails.js";

test("failed mail is retained for retry and successful mail is not resent", async () => {
  const connect = pool.connect, transport = nodemailer.createTransport;
  const env = Object.fromEntries(["SMTP_HOST","SMTP_USER","SMTP_PASS"].map(key=>[key,process.env[key]]));
  Object.assign(process.env,{SMTP_HOST:"test",SMTP_USER:"test",SMTP_PASS:"test"});
  let sent=false, eligible=true, failures=0, deliveries=0;
  pool.connect=async()=>({ release(){}, async query(sql){
    if(sql.startsWith("SELECT * FROM order_email_events"))return {rows:eligible&&!sent?[{id:1,payload:{to:"nobody@example.test",subject:"Test"}}]:[]};
    if(sql.includes("last_error=$2")){failures++;eligible=false;}
    if(sql.includes("sent_at=NOW()"))sent=true;
    return {rows:[]};
  }});
  nodemailer.createTransport=()=>({async sendMail(message){ deliveries++; assert.equal(message.messageId,"<order-event-1@eyechamp.pk>"); if(deliveries===1)throw new Error("Simulated SMTP failure"); }});
  try {
    await deliverOrderEmails(); assert.equal(failures,1); assert.equal(sent,false);
    eligible=true; await deliverOrderEmails(); assert.equal(sent,true); assert.equal(deliveries,2);
    await deliverOrderEmails(); assert.equal(deliveries,2);
  } finally {
    pool.connect=connect;nodemailer.createTransport=transport;
    for(const [key,value] of Object.entries(env)) {if(value===undefined)delete process.env[key];else process.env[key]=value;}
    await pool.end();
  }
});
