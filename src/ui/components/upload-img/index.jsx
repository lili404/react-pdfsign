import React from 'react';
import {UploadOutlined} from '@ant-design/icons';
import {Upload as AntUpload} from 'antd';
import {Button} from 'antd';

const UploadImg = ({convertImageToBlock}) => {
  const uploadProps = {
    name: 'file',
    accept: 'image/*',
    maxCount: 1,
    showUploadList: false,
    beforeUpload(file) {
      convertImageToBlock(file);
      return false;
    },
  };

  return (
    <AntUpload {...uploadProps}>
      <Button icon={<UploadOutlined />}>Add Image</Button>
    </AntUpload>
  );
};

export default UploadImg;
