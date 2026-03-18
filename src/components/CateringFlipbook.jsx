"use client";

import React, { useState, useEffect, useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from "pdfjs-dist";

// Need to set the workerSrc for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const Page = React.forwardRef((props, ref) => {
  return (
    <div className="demoPage" ref={ref} style={{ background: "var(--background)", border: "1px solid rgba(0,0,0,0.1)", boxShadow: "inset 0 0 20px rgba(0,0,0,0.1)" }}>
      {props.children}
    </div>
  );
});

export default function CateringFlipbook({ pdfUrl }) {
  const [numPages, setNumPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState(null);
  const canvasRefs = useRef({});

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    };
    loadPdf();
  }, [pdfUrl]);

  useEffect(() => {
    if (!pdfDoc || numPages === 0) return;

    const renderPage = async (pageNumber) => {
      const page = await pdfDoc.getPage(pageNumber);
      const canvas = canvasRefs.current[pageNumber];
      if (!canvas) return;

      const viewport = page.getViewport({ scale: 1.5 });
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      await page.render(renderContext).promise;
    };

    for (let i = 1; i <= numPages; i++) {
      renderPage(i);
    }
  }, [pdfDoc, numPages]);

  if (numPages === 0) {
    return <div style={{ padding: "50px", textAlign: "center" }}>Loading Catering Menu...</div>;
  }

  // Create an array of page numbers
  const pages = Array.from({ length: numPages }, (_, i) => i + 1);

  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "40px 0" }}>
      <HTMLFlipBook 
        width={350} 
        height={500} 
        size="stretch"
        minWidth={300}
        maxWidth={500}
        minHeight={400}
        maxHeight={700}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        className="flipbook"
      >
        {pages.map((pageNum) => (
          <Page key={pageNum}>
            <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden", background: "#fff" }}>
              <canvas 
                ref={el => canvasRefs.current[pageNum] = el}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            </div>
          </Page>
        ))}
      </HTMLFlipBook>
    </div>
  );
}
