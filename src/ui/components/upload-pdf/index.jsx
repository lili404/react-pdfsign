import React from 'react';
import {UploadOutlined} from '@ant-design/icons';
import {Upload as AntUpload} from 'antd';
import {Button} from 'antd';
import styles from './uploadPdf.module.scss';

const UploadPDF = ({buttonText, pdfUrl, setPdfUrl, setPdfName}) => {
  const uploadProps = {
    name: 'file',
    accept: 'application/pdf',
    maxCount: 1,
    showUploadList: false,
    beforeUpload(file) {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      setPdfUrl(URL.createObjectURL(file));
      setPdfName(file.name);
      return false;
    },
  };

  return (
    <AntUpload {...uploadProps} className={styles.upload}>
      <Button icon={<UploadOutlined />} className={styles.button}>
        {buttonText ? buttonText : 'Upload PDF'}
      </Button>
    </AntUpload>
  );
};

export default UploadPDF;
