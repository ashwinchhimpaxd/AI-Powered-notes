import { useState, useRef, useEffect } from "react";
import { BarcodeIcon, FilePdfIcon } from '@phosphor-icons/react'
import { useExportPDF } from "./Hooks/useExportPDF.jsx"
import { showToast } from "../../utils/showToast.js";
import { handleError } from "../../../../utils/errorHandler.js";
import { useSelector } from "react-redux";
import userAuthService from "../../../../AppWrite/auth.js"
import AppwriteConfig from "../../../../appwriteConfigrationKeys/ConfigrationofAppwrite.js";


export function CustomDropdown({ editor }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const dropdownRef = useRef(null);
    const fileInputRef = useRef(null); // 1. Input ke liye ref banaya
    const { exportToPDF } = useExportPDF();
    const title = useSelector((state) => state.currentnoteinfoslice.currentnoteinfo?.title || "Untitled Note");


    // File select hone par ye function chalega
    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsExtracting(true);
        try {
            // File se base64 string banao
            const convertToBase64 = (file) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = (error) => reject(error);
                });
            };
            const base64Data = await convertToBase64(file);

            const result = await userAuthService.triggerFunction(
                '6a3d7a620000844f5f7c',
                { action: "ScanDoc", file: base64Data, endpoint: AppwriteConfig.ocrendpoint }
            );


            const parsedResult = result.data;

            if (parsedResult.OCRExitCode === 1) {
                const parsedText = parsedResult.ParsedResults?.[0]?.ParsedText;
                if (parsedText) {
                    // Convert plain text newlines into HTML paragraphs to preserve structure in Tiptap
                    const formattedHtml = parsedText
                        .split(/\r?\n/)
                        .map(line => {
                            if (!line.trim()) return "<p></p>";
                            const escaped = line
                                .replace(/&/g, "&amp;")
                                .replace(/</g, "&lt;")
                                .replace(/>/g, "&gt;");
                            return `<p>${escaped}</p>`;
                        })
                        .join("");
                    editor.commands.insertContent(formattedHtml);
                    showToast("success", "Text extracted successfully!");
                } else {
                    showToast("warning", "No text found in the image.");
                }
            } else {
                const ocrErrorMessage = parsedResult.ErrorMessage?.[0] || parsedResult.ErrorMessage || "Failed to extract text from image.";
                const errorObj = new Error(ocrErrorMessage);
                handleError(errorObj, { action: "Image text extraction API response" });
            }

        } catch (error) {
            handleError(error, { action: "Extracting text from image" });
        } finally {
            setIsExtracting(false);
            if (e.target) e.target.value = ''; // Input clear reset
        }
    };

    // Menu for list items 
    const menuItems = [
        {
            label: isExtracting ? "Extracting..." : "Scan Doc",
            icon: isExtracting ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <BarcodeIcon size={19} className="rotate-90 text-purple-300" />
            ),
            action: isExtracting ? null : () => {
                setIsOpen(false);
                fileInputRef.current.click();
            }

        },
        {
            label: "Export PDF", icon: <FilePdfIcon size={19} className="text-purple-300" />,
            action: () => {
                const text = editor.getText().trim();
                if (!text) {
                    showToast("warning", "Note is empty to make PDF");
                    return;
                }

                exportToPDF(editor, title);
            }
        },
    ];
    // Bahar click karne par menu band ho jaye
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative list-items z-999!" ref={dropdownRef}>

            {/* Hidden Input Tag */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                capture="environment" // Mobile ke liye direct camera
                className="hidden"
            />

            <button
                disabled={isExtracting}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center pl-3 transition-all outline-none cursor-pointer">
                {isExtracting ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mb-1"></div>
                ) : (
                    <span className="text-[1.8rem] font-semibold text-foreground mb-3">...</span>
                )}
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-56 border border-foreground/10 bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl py-2 z-100 animate-in fade-in zoom-in duration-200"
                    style={{
                        background: `
                            radial-gradient(ellipse at top left, rgba(59,130,246,0.18) 0%, transparent 65%),
                            radial-gradient(ellipse at bottom right, rgba(168,85,247,0.18) 0%, transparent 65%)
                        `
                    }}
                >
                    <div className="text-[0.9rem] uppercase font-bold text-purple-400 px-3 pt-1 pb-1">AI Tools</div>
                    <div className="border-t-[0.1px] border-foreground/10 px-1">
                        {menuItems?.map((item, index) => (
                            <button
                                key={index}
                                onClick={item.action}
                                disabled={item.action === null}
                                className={`w-full cursor-pointer rounded-lg hover:bg-primary/10 text-foreground font-normal flex justify-start items-center gap-2 px-3 py-1 ${item.action === null ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {item?.icon}
                                <p className='text-md font-semibold text-foreground'>{item?.label}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}