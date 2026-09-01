"use client";

import Link from "next/link";
import Image from "next/image";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { ArrowLeft, ImagePlus, Package, Trash2, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { showAuthToast } from "@/components/AuthToast";
import "./new-product.css";

type Media = { name: string; url: string };
type CategoryOption = { id: string; name: string; parentId: string | null };
type NamedOption = { name: string };
type VariantOption = {
  id: number;
  name: string;
  values: string[];
  input: string;
};

export default function NewProductPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [status, setStatus] = useState("Active");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [media, setMedia] = useState<Media[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [lensCompatibility, setLensCompatibility] = useState<string[]>([]);
  const [lensInput, setLensInput] = useState("");
  const [variants, setVariants] = useState<VariantOption[]>([]);
  const [variantMedia, setVariantMedia] = useState<Record<string, Media[]>>({});
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [selectedMainCategories, setSelectedMainCategories] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [collectionOptions, setCollectionOptions] = useState<string[]>([]);
  const [brandOptions, setBrandOptions] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/admin/categories", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as { categories?: CategoryOption[]; error?: string };
        if (!response.ok) throw new Error(result.error);
        setCategoryOptions(result.categories ?? []);
      })
      .catch(() => showAuthToast({ message: "Could not load product categories.", type: "error" }));
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/collections", { cache: "no-store" }),
      fetch("/api/admin/brands", { cache: "no-store" }),
    ]).then(async ([collectionsResponse, brandsResponse]) => {
      const collectionsResult = await collectionsResponse.json() as { collections?: NamedOption[]; error?: string };
      const brandsResult = await brandsResponse.json() as { brands?: NamedOption[]; error?: string };
      if (!collectionsResponse.ok || !brandsResponse.ok) throw new Error(collectionsResult.error || brandsResult.error);
      setCollectionOptions((collectionsResult.collections ?? []).map((collection) => collection.name));
      setBrandOptions((brandsResult.brands ?? []).map((brand) => brand.name));
    }).catch(() => showAuthToast({ message: "Could not load collections or brands.", type: "error" }));
  }, []);

  const save = async (statusOverride?: "Draft") => {
    const form = document.getElementById("new-product-form") as HTMLFormElement | null;
    if (!form || saving || !form.reportValidity()) return;
    const data = new FormData(form);
    const payload = {
      title: String(data.get("title") || ""), description: String(data.get("description") || ""),
      price: String(data.get("price") || ""), comparePrice: String(data.get("comparePrice") || ""), cost: String(data.get("cost") || ""),
      taxable: data.has("taxable"), sku: String(data.get("sku") || ""), barcode: String(data.get("barcode") || ""),
      trackQuantity: data.has("trackQuantity"), quantity: String(data.get("quantity") || "0"), continueSelling: data.has("continueSelling"),
      shape: String(data.get("shape") || ""), material: String(data.get("material") || ""), rim: String(data.get("rim") || ""), fit: String(data.get("fit") || ""),
      weight: String(data.get("weight") || ""), feature: String(data.get("feature") || ""),
      measurements: { lensWidth: data.get("lens-width"), bridge: data.get("bridge"), templeLength: data.get("temple-length"), lensHeight: data.get("lens-height") },
      lensCompatibility: data.getAll("lensCompatibility").map(String), variants: variants.map(({ id, name, values }) => ({ name, values, mediaByValue: Object.fromEntries(values.map((value) => [value, variantMedia[`${id}:${value}`] ?? []])) })),
      status: statusOverride ?? status, genders: data.getAll("gender").map(String), categories: data.getAll("category").map(String),
      subcategories: data.getAll("subCategory").map(String), collections: data.getAll("collections").map(String), brands: data.getAll("brands").map(String),
      tags: String(data.get("tags") || "").split(",").map((tag) => tag.trim()).filter(Boolean), media: media.map((item, index) => ({ name: item.name, url: item.url, primary: index === 0 })),
    };
    setSaving(true);
    try {
      const response = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { product?: { id: string }; error?: string };
      if (!response.ok) throw new Error(result.error || "Could not save product.");
      setSaved(true); window.setTimeout(() => setSaved(false), 2400);
      showAuthToast({ message: statusOverride === "Draft" ? "Product saved as draft." : "Product added successfully.", type: "success" });
    } catch (error) { showAuthToast({ message: error instanceof Error ? error.message : "Could not save product.", type: "error" }); }
    finally { setSaving(false); }
  };
  const addMedia = async (files: FileList | null) => {
    if (!files?.length || uploadingMedia) return;
    const candidates = Array.from(files).slice(0, 8 - media.length);
    const selectedFiles = candidates.filter((file) => file.size <= 2 * 1024 * 1024);
    if (selectedFiles.length !== candidates.length) showAuthToast({ message: "Images larger than 2 MB were not uploaded.", type: "error" });
    if (!selectedFiles.length) return;
    const uploadData = new FormData();
    selectedFiles.forEach((file) => uploadData.append("images", file));
    setUploadingMedia(true);
    try {
      const response = await fetch("/api/admin/uploads/products", { method: "POST", body: uploadData });
      const result = await response.json() as { media?: Media[]; error?: string };
      if (!response.ok || !result.media) throw new Error(result.error || "Could not upload images.");
      setMedia((current) => [...current, ...result.media!].slice(0, 8));
      showAuthToast({ message: `${result.media.length} image${result.media.length === 1 ? "" : "s"} uploaded.`, type: "success" });
    } catch (error) { showAuthToast({ message: error instanceof Error ? error.message : "Could not upload images.", type: "error" }); }
    finally { setUploadingMedia(false); }
  };
  const removeMedia = (url: string) => {
    URL.revokeObjectURL(url);
    setMedia((current) => current.filter((item) => item.url !== url));
  };
  const addLensCompatibility = () => {
    const value = lensInput.trim();
    if (
      !value ||
      lensCompatibility.some(
        (item) => item.toLowerCase() === value.toLowerCase()
      )
    )
      return;
    setLensCompatibility((current) => [...current, value]);
    setLensInput("");
  };
  const updateVariant = (id: number, changes: Partial<VariantOption>) =>
    setVariants((current) =>
      current.map((option) =>
        option.id === id ? { ...option, ...changes } : option
      )
    );
  const addVariantValue = (id: number) =>
    setVariants((current) =>
      current.map((option) => {
        if (option.id !== id) return option;
        const value = option.input.trim();
        if (
          !value ||
          option.values.some(
            (item) => item.toLowerCase() === value.toLowerCase()
          )
        )
          return option;
        return { ...option, values: [...option.values, value], input: "" };
      })
    );
  const removeVariantValue = (id: number, value: string) => {
    setVariants((current) =>
      current.map((option) =>
        option.id === id
          ? {
              ...option,
              values: option.values.filter((item) => item !== value),
            }
          : option
      )
    );
    setVariantMedia((current) => { const next = { ...current }; delete next[`${id}:${value}`]; return next; });
  };
  const addVariantMedia = async (id: number, value: string, files: FileList | null) => {
    const key = `${id}:${value}`, current = variantMedia[key] ?? [];
    if (!files?.length || current.length >= 4) return;
    const selectedFiles = Array.from(files).slice(0, 4 - current.length).filter((file) => file.size <= 2 * 1024 * 1024);
    if (!selectedFiles.length) return showAuthToast({ message: "Color images must be 2 MB or smaller.", type: "error" });
    const uploadData = new FormData(); selectedFiles.forEach((file) => uploadData.append("images", file));
    try {
      const response = await fetch("/api/admin/uploads/products", { method: "POST", body: uploadData });
      const result = await response.json() as { media?: Media[]; error?: string };
      if (!response.ok || !result.media) throw new Error(result.error || "Could not upload color images.");
      setVariantMedia((existing) => ({ ...existing, [key]: [...(existing[key] ?? []), ...result.media!].slice(0, 4) }));
      showAuthToast({ message: `Images uploaded for ${value}.`, type: "success" });
    } catch (error) { showAuthToast({ message: error instanceof Error ? error.message : "Could not upload color images.", type: "error" }); }
  };
  const addVariant = () =>
    setVariants((current) => [
      ...current,
      { id: Date.now(), name: "Size", values: [], input: "" },
    ]);

  return (
    <main className="np-admin">
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <section className="np-workspace">
        <AdminTopbar onMenuOpen={() => setMenuOpen(true)} />
        <div className="np-content">
          <div className="np-pagehead">
            <div>
              <Link href="/admin/products">
                <ArrowLeft size={16} /> Products
              </Link>
              <h1>Add new product</h1>
              <p>Create a frame using the details shown on the product page.</p>
            </div>
            <div>
              <Link href="/admin/products">Discard</Link>
              <button type="button" className="np-draft" onClick={() => save("Draft")} disabled={saving}>
                {saving ? "Saving..." : "Save as draft"}
              </button>
              <button type="submit" form="new-product-form" className="np-save" disabled={saving}>
                Save product
              </button>
            </div>
          </div>
          {saved && (
            <div className="np-toast" role="status">
              <span>✓</span> Product details saved successfully.
            </div>
          )}
          <form
            id="new-product-form"
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <div className="np-maincol">
              <section className="np-card">
                <CardTitle
                  number="01"
                  title="Product information"
                  subtitle="Add the basic details customers will see."
                />
                <Field className="full" label="Product title">
                  <input
                    name="title"
                    required
                    maxLength={70}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Tortoiseshell Square Glasses"
                  />
                  <small>{title.length}/70 characters</small>
                </Field>
                <Field className="full" label="Description">
                  <div className="np-editor">
                    <div>
                      <button type="button">
                        <b>B</b>
                      </button>
                      <button type="button">
                        <i>I</i>
                      </button>
                      <button type="button">☷</button>
                      <button type="button">↗</button>
                    </div>
                    <textarea
                      name="description"
                      placeholder="Describe the frame style, fit, and standout features..."
                    />
                  </div>
                  <small>This appears in the Description tab.</small>
                </Field>
              </section>

              <section className="np-card">
                <CardTitle
                  number="02"
                  title="Product media"
                  subtitle="Add front, side, angle, folded, and case views."
                  aside={`${media.length} / 8 images`}
                />
                {media.length > 0 && (
                  <div className="np-media-grid">
                    {media.map((item, index) => (
                      <div key={item.url}>
                        <Image
                          src={item.url}
                          alt={`${item.name} preview`}
                          width={180}
                          height={105}
                          unoptimized
                        />
                        <span>{index ? `View ${index + 1}` : "Primary"}</span>
                        <button
                          type="button"
                          onClick={() => removeMedia(item.url)}
                          aria-label={`Remove ${item.name}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="np-dropzone">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    multiple
                    disabled={media.length >= 8 || uploadingMedia}
                    onChange={(event) => {
                      addMedia(event.target.files);
                      event.target.value = "";
                    }}
                  />
                  <span>
                    <ImagePlus size={24} />
                  </span>
                  <strong>
                    {uploadingMedia ? (
                      "Uploading images..."
                    ) : media.length >= 8 ? (
                      "Maximum 8 images added"
                    ) : (
                      <>
                        Drop images here or <u>browse files</u>
                      </>
                    )}
                  </strong>
                  <small>PNG, JPG, WEBP or AVIF · Up to 8 images · Maximum 2 MB each</small>
                </label>
                <div className="np-media-tip">
                  <span>i</span>
                  <p>
                    <strong>Image tip</strong> Keep the glasses centered on a
                    neutral background. The first image becomes the front view.
                  </p>
                </div>
              </section>

              <section className="np-card">
                <CardTitle
                  number="03"
                  title="Pricing"
                  subtitle="Set the product page’s starting price and cost."
                />
                <div className="np-fields three">
                  <Money
                    label="Starting price"
                    name="price"
                    value={price}
                    onChange={setPrice}
                    required
                  />
                  <Money label="Compare-at price" name="comparePrice" />
                  <Money label="Cost per item" name="cost" />
                </div>
                <Check
                  label="Charge tax on this product"
                  name="taxable"
                  checked
                />
              </section>

              <section className="np-card">
                <CardTitle
                  number="04"
                  title="Inventory & shipping"
                  subtitle="Track stock and configure fulfillment details."
                />
                <div className="np-fields">
                  <Field label="SKU (Stock Keeping Unit)">
                    <input name="sku" placeholder="EC-FR-001" />
                  </Field>
                  <Field label="Barcode">
                    <input name="barcode" placeholder="ISBN, UPC, GTIN, etc." />
                  </Field>
                </div>
                <Check label="Track quantity" name="trackQuantity" checked />
                <div className="np-location">
                  <div>
                    <Package size={18} />
                    <span>
                      <strong>Eye Champ warehouse</strong>
                      <small>Main fulfillment location</small>
                    </span>
                  </div>
                  <div>
                    <label htmlFor="quantity">Available</label>
                    <input
                      id="quantity"
                      name="quantity"
                      type="number"
                      defaultValue="0"
                      min="0"
                    />
                  </div>
                </div>
                <Check
                  label="Continue selling when out of stock"
                  name="continueSelling"
                />
              </section>

              <section className="np-card">
                <CardTitle
                  number="05"
                  title="Frame specifications"
                  subtitle="These details populate the Features section on /product."
                />
                <div className="np-fields three">
                  <Select
                    label="Frame shape"
                    name="shape"
                    values={[
                      "Square",
                      "Rectangle",
                      "Round",
                      "Cat eye",
                      "Browline",
                      "Aviator",
                    ]}
                  />
                  <Select
                    label="Frame material"
                    name="material"
                    values={["Plastic", "Metal", "Mix material", "Acetate"]}
                  />
                  <Select
                    label="Rim"
                    name="rim"
                    values={["Full Rim", "Half Rim", "Rimless"]}
                  />
                  <Select
                    label="Fit / width"
                    name="fit"
                    values={["Large", "Medium", "Narrow", "Extra wide"]}
                  />
                  <Field label="Frame weight">
                    <div className="np-money">
                      <input
                        name="weight"
                        inputMode="decimal"
                        placeholder="23"
                      />
                      <span>g</span>
                    </div>
                  </Field>
                  <Field label="Special feature">
                    <input name="feature" placeholder="Spring Hinges" />
                  </Field>
                </div>
                <div className="np-measurements">
                  <div className="np-glasses-icon">⌁</div>
                  {[
                    ["Lens width", "52"],
                    ["Bridge", "19"],
                    ["Temple length", "143"],
                    ["Lens height", "42"],
                  ].map(([label, placeholder]) => (
                    <Field label={label} key={label}>
                      <div>
                        <input
                          name={label.toLowerCase().replaceAll(" ", "-")}
                          inputMode="numeric"
                          placeholder={placeholder}
                        />
                        <span>mm</span>
                      </div>
                    </Field>
                  ))}
                </div>
                <div className="np-compatibility">
                  <strong>Lens compatibility</strong>
                  <div className="np-compatibility-input">
                    <input
                      value={lensInput}
                      onChange={(event) => setLensInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addLensCompatibility();
                        }
                      }}
                      placeholder="e.g. Transitions®"
                    />
                    <button type="button" onClick={addLensCompatibility}>
                      Add
                    </button>
                  </div>
                  {lensCompatibility.length > 0 ? (
                    <div className="np-compatibility-tags">
                      {lensCompatibility.map((item) => (
                        <span key={item}>
                          {item}
                          <input
                            type="hidden"
                            name="lensCompatibility"
                            value={item}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setLensCompatibility((current) =>
                                current.filter((value) => value !== item)
                              )
                            }
                            aria-label={`Remove ${item}`}
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <small>No lens compatibility options added yet.</small>
                  )}
                </div>
              </section>

              <section className="np-card np-variants">
                <CardTitle
                  number="06"
                  title="Colors & variants"
                  subtitle="Add colors, sizes, or other options customers can select."
                  aside={
                    <button type="button" onClick={addVariant}>
                      + Add option
                    </button>
                  }
                />
                {variants.map((option, optionIndex) => (
                  <div className="np-option" key={option.id}>
                    <Field label="Option name">
                      <select
                        name={`variants[${optionIndex}][name]`}
                        value={option.name}
                        onChange={(event) =>
                          updateVariant(option.id, { name: event.target.value })
                        }
                      >
                        <option>Frame color</option>
                        <option>Size</option>
                        <option>Lens color</option>
                      </select>
                    </Field>
                    <Field label="Option values">
                      <div className="np-tags">
                        {option.values.map((value) => (
                          <span key={value}>
                            {option.name.toLowerCase().includes("color") && (
                              <i style={{ background: colorFor(value) }} />
                            )}
                            {value}
                            <input
                              type="hidden"
                              name={`variants[${optionIndex}][values]`}
                              value={value}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                removeVariantValue(option.id, value)
                              }
                              aria-label={`Remove ${value}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <input
                          value={option.input}
                          onChange={(event) =>
                            updateVariant(option.id, {
                              input: event.target.value,
                            })
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              addVariantValue(option.id);
                            }
                          }}
                          placeholder="Add value"
                        />
                        <button
                          type="button"
                          className="np-add-value"
                          onClick={() => addVariantValue(option.id)}
                        >
                          Add
                        </button>
                      </div>
                    </Field>
                    <button
                      type="button"
                      onClick={() =>
                        setVariants((current) =>
                          current.filter((item) => item.id !== option.id)
                        )
                      }
                      aria-label={`Delete ${option.name} option`}
                    >
                      <Trash2 size={17} />
                    </button>
                    {option.name === "Frame color" && option.values.length > 0 && <div className="np-variant-media">
                      <strong>Images by color</strong>
                      {option.values.map((value) => { const key = `${option.id}:${value}`, images = variantMedia[key] ?? []; return <div className="np-color-media-row" key={value}>
                        <span className="np-color-name"><i style={{background:colorFor(value)}}/>{value}</span>
                        <div className="np-color-images">{images.map((item) => <span key={item.url}><Image src={item.url} alt={`${value} product`} width={54} height={42} unoptimized/><button type="button" onClick={() => setVariantMedia((current) => ({...current,[key]:(current[key]??[]).filter((image) => image.url !== item.url)}))} aria-label={`Remove ${item.name}`}><X size={11}/></button></span>)}</div>
                        <label className="np-color-upload"><input type="file" accept="image/png,image/jpeg,image/webp,image/avif" multiple disabled={images.length>=4} onChange={(event)=>{addVariantMedia(option.id,value,event.target.files);event.target.value=""}}/><ImagePlus size={14}/>{images.length>=4?"4 images added":"Add images"}</label>
                      </div>})}
                      <small>Up to 4 images per color, maximum 2 MB each.</small>
                    </div>}
                  </div>
                ))}
                {variants.length === 0 && (
                  <div className="np-variants-empty">
                    <p>No options added.</p>
                    <button type="button" onClick={addVariant}>
                      Add your first option
                    </button>
                  </div>
                )}
              </section>
            </div>

            <aside className="np-sidecol">
              <section className="np-card np-status">
                <h2>Status</h2>
                <label htmlFor="status">Product status</label>
                <select
                  id="status"
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option>Active</option>
                  <option>Draft</option>
                  <option>Archived</option>
                </select>
                <div className={status.toLowerCase()}>
                  <i />
                  {status === "Active"
                    ? "This product will be visible in your store."
                    : status === "Draft"
                    ? "Only staff can view this product."
                    : "This product is hidden from your store."}
                </div>
              </section>
              <section className="np-card">
                <h2>Organization</h2>
                <MultiCheck
                  label="Gender"
                  name="gender"
                  values={["Men", "Women"]}
                />
                
                <MultiCheck
                  label="Category"
                  name="category"
                  values={categoryOptions.filter((category) => category.parentId === null).map((category) => category.name)}
                  selectedValues={selectedMainCategories}
                  onSelectedValuesChange={(values) => { setSelectedMainCategories(values); setSelectedSubCategories([]); }}
                />

                <MultiCheck
                  label="Sub category"
                  name="subCategory"
                  values={categoryOptions.filter((category) => {
                    const selectedParentIds = categoryOptions.filter((parent) => parent.parentId === null && selectedMainCategories.includes(parent.name)).map((parent) => parent.id);
                    return category.parentId !== null && selectedParentIds.includes(category.parentId);
                  }).map((category) => category.name)}
                  selectedValues={selectedSubCategories}
                  onSelectedValuesChange={setSelectedSubCategories}
                />

                <MultiCheck
                  label="Collections"
                  name="collections"
                  values={collectionOptions}
                />

                 <MultiCheck
                  label="Brands"
                  name="brands"
                  values={brandOptions}
                />
                <Field label="Tags">
                  <input name="tags" placeholder="Vintage, lightweight..." />
                  <small>Separate tags with commas</small>
                </Field>
              </section>
            </aside>
          </form>
        </div>
      </section>
    </main>
  );
}

function CardTitle({
  number,
  title,
  subtitle,
  aside,
}: {
  number: string;
  title: string;
  subtitle: string;
  aside?: ReactNode;
}) {
  return (
    <div className="np-cardtitle">
      <span>{number}</span>
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {aside && <div className="np-card-action">{aside}</div>}
    </div>
  );
}
function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`np-field ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}
function Select({
  label,
  name,
  values,
}: {
  label: string;
  name: string;
  values: string[];
}) {
  return (
    <Field label={label}>
      <select name={name}>
        {values.map((value) => (
          <option key={value}>{value}</option>
        ))}
      </select>
    </Field>
  );
}
function MultiCheck({
  label,
  name,
  values,
  selectedValues,
  onSelectedValuesChange,
}: {
  label: string;
  name: string;
  values: string[];
  selectedValues?: string[];
  onSelectedValuesChange?: (values: string[]) => void;
}) {
  return (
    <fieldset className="np-multicheck">
      <legend>{label}</legend>
      <div>
        {values.length === 0 ? <p className="no-options">No options available.</p> : values.map((value) => (
          <label key={value}>
            <input
              type="checkbox"
              name={name}
              value={value}
              checked={selectedValues?.includes(value)}
              onChange={onSelectedValuesChange ? (event) => onSelectedValuesChange(event.target.checked ? [...(selectedValues ?? []), value] : (selectedValues ?? []).filter((item) => item !== value)) : undefined}
            />
            <span>{value}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
function Money({
  label,
  name,
  value,
  onChange,
  required,
}: {
  label: string;
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
}) {
  return (
    <Field label={label}>
      <div className="np-money">
        <span>Rs</span>
        <input
          name={name}
          required={required}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          inputMode="decimal"
          placeholder="0.00"
        />
      </div>
    </Field>
  );
}
function Check({
  label,
  name,
  checked = false,
}: {
  label: string;
  name: string;
  checked?: boolean;
}) {
  return (
    <label className="np-check">
      <input
        name={name}
        value={label}
        type="checkbox"
        defaultChecked={checked}
      />
      {label}
    </label>
  );
}
function colorFor(value: string) {
  const colors: Record<string, string> = {
    black: "#151515",
    tortoiseshell:
      "radial-gradient(circle at 70% 25%, #edb02d 0 18%, #2a1708 23% 48%, #aa6819 52%)",
    brown: "#795036",
    blue: "#315f91",
    red: "#a94747",
    green: "#49735a",
    gold: "#b79a53",
    silver: "#aeb7ba",
    clear: "#e8eeee",
  };
  return colors[value.toLowerCase()] ?? "#d8e1e2";
}
