"use client";
import NewProductPage from "@/app/admin/products/new/page";
import {use} from "react";
export default function EditProductPage({params}:{params:Promise<{id:string}>}){const{id}=use(params);return <NewProductPage editId={id}/>}
