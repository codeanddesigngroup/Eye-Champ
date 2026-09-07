"use client";

import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import styles from "./page.module.css";

export default function StoreLocator() {
  const [country, setCountry] = useState("Pakistan");
  const [address, setAddress] = useState("");
  const [mapQuery, setMapQuery] = useState("Pakistan");
  const [filters, setFilters] = useState(false);
  const [storeType, setStoreType] = useState("Ray-Ban stores");
  const [locationMessage, setLocationMessage] = useState("");
  const [domainMessage, setDomainMessage] = useState("");

  function findStores(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMapQuery(`${storeType} near ${address.trim()}, ${country}`);
    setLocationMessage(`Showing map results near ${address.trim()}, ${country}. Contact a store directly to confirm availability and appointments.`);
  }

  function checkDomain(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = String(new FormData(event.currentTarget).get("domain") ?? "").trim();
    try {
      const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
      if (!url.hostname.includes(".") || url.username || url.password || !["http:", "https:"].includes(url.protocol)) throw new Error("Invalid domain");
      setDomainMessage(`We cannot verify the certification of ${url.hostname} here yet. Please contact support to check this reseller before purchasing.`);
    } catch {
      setDomainMessage("Please enter a valid website domain, such as www.example.com.");
    }
  }

  return <main id="top" className={styles.page}>
    <section className={styles.locator} aria-labelledby="locator-heading">
      <aside className={styles.sidebar}>
        <h1 id="locator-heading">STORE LOCATOR</h1>
        <p>Find the <strong>Ray-Ban store nearest to you</strong>, book an appointment, and live the iconic premium eyewear experience.</p>
        <form onSubmit={findStores} className={styles.locationForm}>
          <label className={styles.srOnly} htmlFor="store-country">Country</label>
          <select id="store-country" value={country} onChange={event => { setCountry(event.target.value); setMapQuery(event.target.value); setLocationMessage(""); }}>
            {["Pakistan", "Czech Republic", "Egypt", "Hungary", "Malaysia", "Morocco", "New Zealand", "Philippines", "Romania", "South Africa", "South Korea", "Vietnam"].map(value => <option key={value}>{value}</option>)}
          </select>
          <div className={styles.address}><label className={styles.srOnly} htmlFor="store-address">Address or zip code</label><input id="store-address" value={address} onChange={event => setAddress(event.target.value)} placeholder="Enter address or zip code" required pattern=".*\S.*" maxLength={200} /><button type="submit" aria-label="Search for stores"><Search size={25} /></button></div>
          <button type="button" className={styles.filterButton} aria-expanded={filters} aria-controls="store-filters" onClick={() => setFilters(!filters)}><SlidersHorizontal size={17} />FILTERS</button>
          <fieldset id="store-filters" hidden={!filters} className={styles.filters}><legend>Search for</legend>{["Ray-Ban stores", "Optical stores", "Sunglasses stores"].map(value => <label key={value}><input type="radio" name="storeType" checked={storeType === value} onChange={() => setStoreType(value)} />{value}</label>)}<button type="submit" className={styles.button}>APPLY FILTERS</button></fieldset>
        </form>
        <p className={styles.hint}>You can locate your nearest Ray-Ban retailer with our store locator.</p>
        <p className={styles.locationStatus} role="status">{locationMessage}</p>
        <a className={styles.mapLink} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noopener noreferrer">Open map in a new tab</a>
      </aside>
      <div className={styles.map}><iframe title="Store locator map" src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`} referrerPolicy="no-referrer-when-downgrade" allowFullScreen /></div>
    </section>
    <section className={styles.banner} aria-label="Come visit our Ray-Ban stores to enjoy the finest brand experience"><h2 className={styles.srOnly}>COME VISIT OUR RAY-BAN STORES TO ENJOY THE FINEST BRAND EXPERIENCE</h2></section>
    <section className={styles.resellers} aria-labelledby="reseller-heading"><h2 id="reseller-heading">RAY-BAN ONLINE CERTIFIED RESELLERS</h2><p>SEARCH BY DOMAIN</p><form className={styles.domainForm} onSubmit={checkDomain}><label className={styles.srOnly} htmlFor="reseller-domain">Reseller website domain</label><input id="reseller-domain" name="domain" type="text" required pattern=".*\S.*" maxLength={253} placeholder="www.ray-ban.com" autoCapitalize="none" spellCheck={false} /><button type="submit" className={styles.button}>SEARCH</button></form>{domainMessage && <div className={styles.domainStatus}><p role="status">{domainMessage}</p><Link href="/get-support#contact-support">Contact support</Link></div>}</section>
    <section className={styles.shop}><p>Want to discover Ray-Ban exclusives and full<br />collections? Shop on our website.</p><Link href="/shop-all" className={styles.button}>SHOP NOW</Link></section>
  </main>;
}
