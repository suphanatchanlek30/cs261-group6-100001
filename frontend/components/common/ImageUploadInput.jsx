"use client";

import { useState, useEffect } from "react";
import { FiUploadCloud, FiLink } from "react-icons/fi";
import { uploadImage } from "@/services/uploadService";
import Swal from "sweetalert2";

/**
 * Reusable image picker
 * Props:
 *  - label?: string
 *  - value: string (image url)
 *  - onChange: (url: string) => void
 *  - uploadFolder?: string (default: 'nangnaidee/uploads')
 *  - hint?: string
 *  - rounded?: string (tailwind rounded class)
 */
export default function ImageUploadInput({
    label = "Image",
    value,
    onChange,
    uploadFolder = "nangnaidee/uploads",
    hint,
    rounded = "rounded-lg",
}) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(value || "");

    useEffect(() => {
        setPreview(value || "");
    }, [value]);

    const handleUpload = async (file) => {
        if (!file) return;
        try {
            setUploading(true);
            const res = await uploadImage(file, uploadFolder);
            onChange?.(res.url);
            setPreview(res.url);
            Swal.fire("อัปโหลดสำเร็จ", "อัปโหลดรูปภาพเรียบร้อยแล้ว", "success");
        } catch (err) {
            Swal.fire("ผิดพลาด", err.message, "error");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2 ">
                    {label}
                </label>
            )}

            {preview ? (
                <img
                    src={preview}
                    alt="preview"
                    className={`w-48 border-1 border-gray-300 shadow-sm ${rounded} mb-3`}
                />
            ) : null}

            {/* URL Field */}
            <div className="flex items-center gap-2 mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 px-3 py-2 border-1 border-gray-300 rounded-lg bg-white">
                        <FiLink className="text-gray-500" />
                        <input
                            type="url"
                            placeholder="วางลิงก์รูปภาพ..."
                            value={value || ""}
                            onChange={(e) => onChange?.(e.target.value)}
                            className="w-full outline-none text-sm text-gray-700"
                        />
                    </div>
                </div>
            </div>

            {/* Upload Button */}
            <label className={`inline-flex items-center gap-2 cursor-pointer px-4 py-2 border border-dashed border-[#7C3AED] ${rounded} hover:bg-purple-50 transition`}>
                <FiUploadCloud className="text-[#7C3AED]" />
                <span className="text-sm text-gray-700">
                    {uploading ? "Uploading..." : "เลือกไฟล์เพื่ออัปโหลด"}
                </span>
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files?.[0])}
                    disabled={uploading}
                />
            </label>

            {hint && <p className="text-xs text-gray-500 mt-2">{hint}</p>}
        </div>
    );
}
