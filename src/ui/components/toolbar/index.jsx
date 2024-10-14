import {
  Button,
  ColorPicker,
  Divider,
  Flex,
  Form,
  InputNumber,
  Slider,
} from 'antd';
import React, {useEffect, useState} from 'react';
import * as fabric from 'fabric';
import {PDFDocument, last} from 'pdf-lib';
import styles from './toolbar.module.scss';
import UploadImg from '../upload-img';
import UploadPDF from '../upload-pdf';

const Toolbar = ({
  pdfUrl,
  setPdfUrl,
  pdfName,
  setPdfName,
  inputCanvasRef,
  inputCanvasRefInstance,
  canvas,
  setCanvas,
  pageNumber,
  pageCount,
  objects,
  setObjects,
  index,
  setIndex,
}) => {
  const [paths, setPaths] = useState([]);
  const [config, setConfig] = useState({
    width: 2,
    color: 'black',
  });

  useEffect(() => {
    const inputCanvas = new fabric.Canvas(inputCanvasRef.current, {
      width: 300,
      height: 200,
      isDrawingMode: true,
      backgroundColor: 'white',
    });

    const brush = new fabric.PencilBrush(inputCanvas);
    brush.width = config.width;
    brush.color = config.color;
    inputCanvas.freeDrawingBrush = brush;

    inputCanvas.on('path:created', (e) => {
      const newPath = e.path;

      setPaths((prevPaths) => [
        ...prevPaths,
        {
          points: newPath.path,
          width: brush.width,
          color: brush.color,
        },
      ]);
    });

    inputCanvasRefInstance.current = inputCanvas;
    setCanvas(inputCanvas);

    return () => {
      inputCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (inputCanvasRefInstance.current) {
      const brush = inputCanvasRefInstance.current.freeDrawingBrush;
      brush.width = config.width;
      brush.color = config.color;
      inputCanvasRefInstance.current.renderAll();
    }
  }, [config]);

  const convertPathToBlock = () => {
    if (paths.length > 0) {
      const pathObjects = paths.map(
        ({points, width, color}) =>
          new fabric.Path(points, {
            fill: 'transparent',
            stroke: color,
            strokeWidth: width,
          })
      );
      const combinedGroup = new fabric.Group(pathObjects, {
        pageNumber: pageNumber,
        customIndex: index,
      });

      canvas.add(combinedGroup);
      setObjects((prev) => [...prev, {object: combinedGroup}]);
      setIndex((prev) => prev + 1);
    }
  };

  const convertImageToBlock = (file) => {
    const reader = new FileReader();
    reader.onload = ({target: {result}}) => {
      const imgElement = new Image();
      imgElement.src = result;

      imgElement.onload = () => {
        const imgInstance = new fabric.Image(imgElement, {
          left: 0,
          top: 0,
          pageNumber,
          customIndex: index,
        });

        canvas.add(imgInstance);
        setObjects((prev) => [...prev, {object: imgInstance}]);
        setIndex((prev) => prev + 1);
      };
    };
    reader.readAsDataURL(file);
  };

  const clearCanvas = () => {
    inputCanvasRefInstance.current.clear();
    inputCanvasRefInstance.current.backgroundColor = 'white';
    setPaths([]);
  };

  const downloadSignedPDF = async () => {
    const existingPdfBytes = await fetch(pdfUrl).then((res) =>
      res.arrayBuffer()
    );

    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    for (let pageNum = 1; pageNum <= pageCount; ++pageNum) {
      const page = pdfDoc.getPage(pageNum - 1);

      const pageObjects = objects
        .filter((obj) => obj.object.pageNumber === pageNum)
        .map((obj) => ({
          x: obj.object.left,
          y: obj.object.top,
          image: obj.object.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 4,
          }),
          width: obj.object.width * obj.object.scaleX,
          height: obj.object.height * obj.object.scaleY,
        }));

      for (const {x, y, image, width, height} of pageObjects) {
        const objectImageBytes = await fetch(image).then((res) =>
          res.arrayBuffer()
        );

        const objectImage = await pdfDoc.embedPng(objectImageBytes);
        page.drawImage(objectImage, {
          x: x,
          y: page.getHeight() - y - height,
          width: width,
          height: height,
        });
      }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], {type: 'application/pdf'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${pdfName.split('.')[0]}_signed.pdf`;
    link.click();
  };

  return (
    <Flex className={styles.toolbar} gap="large" vertical>
      <UploadPDF
        buttonText="Change PDF"
        pdfUrl={pdfUrl}
        setPdfUrl={setPdfUrl}
        setPdfName={setPdfName}
      />
      <h2>Canvas</h2>
      <canvas ref={inputCanvasRef}></canvas>
      <Flex className={styles.inputCanvasActions} vertical gap="small">
        <Form
          className={styles.form}
          initialValues={config}
          onValuesChange={(_, values) => {
            if (typeof values.color === 'object' && values.color !== null) {
              values.color = values.color.toHexString();
            }
            setConfig((prevConfig) => ({...prevConfig, ...values}));
          }}
        >
          <Form.Item>
            <h2>Brush settings</h2>
          </Form.Item>
          <Flex gap="middle">
            <Form.Item className={styles.slider} name="width" label="Width">
              <InputNumber min={1} max={16} />
            </Form.Item>
            <Form.Item name="color" label="Color">
              <ColorPicker />
            </Form.Item>
          </Flex>
        </Form>
        <Flex gap="middle">
          <Button
            className={styles.button}
            onClick={convertPathToBlock}
            disabled={!paths.length}
          >
            Place on the Page
          </Button>
          <Button className={styles.button} onClick={clearCanvas}>
            Clear canvas
          </Button>
        </Flex>
      </Flex>
      <h2>Extra</h2>
      <UploadImg convertImageToBlock={convertImageToBlock} />
      <Button
        className={styles.downloadBtn}
        type="primary"
        onClick={downloadSignedPDF}
      >
        Download signed PDF
      </Button>
    </Flex>
  );
};

export default Toolbar;
