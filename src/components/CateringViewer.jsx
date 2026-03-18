"use client";

import React, { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function CateringViewer({ pdfUrl }) {
  const [numPages, setNumPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRefs = useRef({});

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setIsLoading(true);
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
      } catch (error) {
        console.error("Error loading PDF:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPdf();
  }, [pdfUrl]);

  useEffect(() => {
    if (!pdfDoc || numPages === 0) return;

    const renderTasks = {};

    const renderPage = async (pageNumber) => {
      const page = await pdfDoc.getPage(pageNumber);
      const canvas = canvasRefs.current[pageNumber];
      if (!canvas) return;

      // Cancel any in-progress render for this page
      if (renderTasks[pageNumber]) {
        renderTasks[pageNumber].cancel();
      }

      const viewport = page.getViewport({ scale: 1.5 });
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      context.clearRect(0, 0, canvas.width, canvas.height);

      const task = page.render({ canvasContext: context, viewport });
      renderTasks[pageNumber] = task;
      try {
        await task.promise;
      } catch (e) {
        // Cancelled renders throw — silently ignore
        if (e?.name !== "RenderingCancelledException") console.error(e);
      }
    };

    for (let i = 1; i <= numPages; i++) {
      renderPage(i);
    }

    return () => {
      // Cleanup: cancel all pending renders on unmount / re-render
      Object.values(renderTasks).forEach((t) => t?.cancel());
    };
  }, [pdfDoc, numPages]);

  if (isLoading) {
    return (
      <div style={{ padding: "50px", textAlign: "center", opacity: 0.7 }}>
        Loading Catering Menu…
      </div>
    );
  }

  if (numPages === 0) {
    return (
      <div style={{ padding: "50px", textAlign: "center", opacity: 0.7 }}>
        Could not load PDF.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center", width: "100%" }}>
      {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
        <div
          key={pageNum}
          className="glass-panel"
          style={{ width: "100%", maxWidth: "800px", overflow: "hidden", display: "flex", justifyContent: "center" }}
        >
          <canvas
            ref={(el) => (canvasRefs.current[pageNum] = el)}
            style={{ maxWidth: "100%", height: "auto", display: "block" }}
          />
        </div>
      ))}
    </div>
  );
}
