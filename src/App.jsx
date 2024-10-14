import React, {useRef, useState} from 'react';
import Preview from './ui/components/preview';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import Toolbar from './ui/components/toolbar';
import {Flex} from 'antd';
import styles from './App.module.scss';
import UploadPDF from './ui/components/upload-pdf';

const App = () => {
  const inputCanvasRef = useRef(null);
  const inputCanvasRefInstance = useRef(null);

  const [lastPath, setLastPath] = useState(null);

  const [canvas, setCanvas] = useState(null);
  const canvasRef = useRef(null);

  const [objects, setObjects] = useState([]);
  const [index, setIndex] = useState(0);

  const [pageCount, setPageCount] = useState();
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfPageSize, setPdfPageSize] = useState({width: null, height: null});

  const [pdfName, setPdfName] = useState('file');
  const [pdfUrl, setPdfUrl] = useState('');

  return (
    <Flex className={styles.app} gap="large" vertical>
      <h2>Sign Applier</h2>
      {!pdfUrl && (
        <UploadPDF
          pdfUrl={pdfUrl}
          setPdfUrl={setPdfUrl}
          setPdfName={setPdfName}
        />
      )}
      <Flex className={styles.appWrapper} gap="large" vertical={!!pdfUrl}>
        {pdfUrl && (
          <Preview
            pdfUrl={pdfUrl}
            pdfPageSize={pdfPageSize}
            setPdfPageSize={setPdfPageSize}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
            pageCount={pageCount}
            setPageCount={setPageCount}
            canvasRef={canvasRef}
            canvas={canvas}
            setCanvas={setCanvas}
            objects={objects}
            setObjects={setObjects}
          />
        )}
        {pdfUrl && (
          <Toolbar
            pdfUrl={pdfUrl}
            setPdfUrl={setPdfUrl}
            pdfName={pdfName}
            setPdfName={setPdfName}
            inputCanvasRef={inputCanvasRef}
            inputCanvasRefInstance={inputCanvasRefInstance}
            lastPath={lastPath}
            setLastPath={setLastPath}
            canvas={canvas}
            setCanvas={setCanvas}
            pageNumber={pageNumber}
            pageCount={pageCount}
            objects={objects}
            setObjects={setObjects}
            index={index}
            setIndex={setIndex}
          />
        )}
      </Flex>
    </Flex>
  );
};

export default App;
