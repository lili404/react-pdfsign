import React, {useEffect, useState} from 'react';
import {pdfjs, Document, Page} from 'react-pdf';
import * as fabric from 'fabric';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import styles from './preview.module.scss';
import {Button, Flex, Pagination} from 'antd';

pdfjs.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';

const Preview = ({
  pdfUrl,
  pdfPageSize,
  setPdfPageSize,
  pageNumber,
  setPageNumber,
  pageCount,
  setPageCount,
  canvasRef,
  canvas,
  setCanvas,
  objects,
  setObjects,
}) => {
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);

  const onDocumentLoadSuccess = async (page) => {
    const pageObj = await page.getPage(pageNumber);
    setPageCount(page.numPages);
    setPdfPageSize({width: pageObj.view[2], height: pageObj.view[3]});
    setIsDocumentLoaded(true);
  };

  const onDocumentLoadError = () => {
    setIsDocumentLoaded(false);
  };

  useEffect(() => {
    if (canvasRef.current) {
      const initCanvas = new fabric.Canvas(canvasRef.current, {
        width: pdfPageSize.width,
        height: pdfPageSize.height,
      });

      initCanvas.backgroundColor = 'transparent';
      initCanvas.renderAll();

      initCanvas.on('object:modified', (e) => {
        const obj = e.target;

        setObjects((prev) =>
          prev.map((item) =>
            item.object.customIndex === obj.customIndex ? {object: obj} : item
          )
        );
      });

      initCanvas.on('mouse:dblclick', (e) => {
        const target = initCanvas.findTarget(e);

        if (target) {
          initCanvas.remove(target);

          setObjects((prev) =>
            prev.filter(
              (item) => item.object.customIndex !== target.customIndex
            )
          );
        }
      });

      setCanvas(initCanvas);

      return () => {
        initCanvas.dispose();
      };
    }
  }, [pdfPageSize]);

  useEffect(() => {
    if (canvas) {
      canvas.clear();

      objects.forEach((obj) => {
        if (obj.object.pageNumber === pageNumber) {
          canvas.add(obj.object);
        }
      });

      canvas.renderAll();
    }
  }, [pageNumber]);

  useEffect(() => {
    if (canvas) {
      objects
        .filter((obj) => obj.pageNumber === pageNumber)
        .forEach((obj) => {
          canvas.add(obj.object);
        });

      canvas.renderAll();
    }
  }, [objects]);

  return (
    <Flex gap="large" vertical>
      <div className={styles.previewWrapper}>
        <Document
          className={styles.document}
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
        >
          <Page className={styles.page} pageNumber={pageNumber} />
        </Document>

        <canvas
          className={styles.canvas}
          ref={canvasRef}
          width={pdfPageSize.width}
          height={pdfPageSize.height}
        ></canvas>
      </div>

      <Pagination
        showQuickJumper
        current={pageNumber}
        total={pageCount}
        onChange={(page) => setPageNumber(page)}
        pageSize={1}
      />
    </Flex>
  );
};

export default Preview;
