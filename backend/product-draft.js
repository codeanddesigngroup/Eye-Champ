// Drafts may be incomplete, but values must still satisfy storage constraints.
export function normalizeDraft(body) {
  const number = (value, fallback = 0) => Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : fallback;
  return {
    ...body,
    title: String(body.title ?? "").trim().slice(0, 200) || "Untitled product",
    price: number(body.price),
    quantity: Math.floor(number(body.quantity)),
    discountPercent: Math.min(100, number(body.discountPercent)),
    weight: body.weight === "" || body.weight == null ? null : number(body.weight),
  };
}

export function validDraftIdentity(key, revision) {
  return typeof key === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)
    && Number.isSafeInteger(revision) && revision > 0;
}
