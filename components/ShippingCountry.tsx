"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCcVisa, faCcMastercard, faCcDinersClub, faCcDiscover } from "@fortawesome/free-brands-svg-icons";
import styles from "./ShippingCountry.module.css";

export default function ShippingCountry() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const modal = dialog.current;
    const previousOverflow = document.body.style.overflow;
    modal?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      modal?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return <>
    <button type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
      <svg className={styles.flag} viewBox="0 0 30 20" aria-hidden="true"><path fill="#fff" d="M0 0h30v20H0z" /><path fill="#01411c" d="M7.5 0H30v20H7.5z" /><path fill="#fff" d="M23.5 13.1a6 6 0 1 1-4.2-8.9 5.2 5.2 0 1 0 4.2 8.9Z" /><path fill="#fff" d="m22.3 4.5.3 2 2 .3-1.8.9.3 2-1.4-1.4-1.8.9.9-1.8-1.4-1.4 2 .3Z" /></svg> PAKISTAN
    </button>
    <dialog ref={dialog} className={styles.modal} aria-labelledby="shipping-country-title" onClose={() => setOpen(false)} onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setOpen(false);
    }}>
      <button type="button" className={styles.close} aria-label="Close shipping information" onClick={() => setOpen(false)}><X size={23} strokeWidth={1.4} /></button>
      <h2 id="shipping-country-title">YOU’RE SHIPPING TO</h2>
      <label className={styles.srOnly} htmlFor="shipping-country">Shipping country</label>
      <select id="shipping-country" className={styles.country} defaultValue="Pakistan"><option>Pakistan</option></select>
      <div className={styles.benefits}>
        <h3>Benefits</h3>
        <p>Secure checkout</p>
        <p>RESPONSIBLE SHIPPING</p>
        <h3>Available payment methods</h3>
        <div className={styles.payments} aria-label="Visa, Mastercard, Diners Club, Discover, Maestro and Visa Electron">
          <FontAwesomeIcon icon={faCcVisa} className={styles.visa} aria-hidden="true" />
          <FontAwesomeIcon icon={faCcMastercard} className={styles.mastercard} aria-hidden="true" />
          <FontAwesomeIcon icon={faCcDinersClub} className={styles.diners} aria-hidden="true" />
          <FontAwesomeIcon icon={faCcDiscover} className={styles.discover} aria-hidden="true" />
          <span className={styles.maestro} aria-hidden="true"><i /><i /><small>maestro</small></span>
          <span className={styles.electron} aria-hidden="true">VISA<small>Electron</small></span>
        </div>
        <p className={styles.currency}><strong>Currency</strong> USD</p>
      </div>
    </dialog>
  </>;
}
