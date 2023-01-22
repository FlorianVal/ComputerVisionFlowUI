import React, { Component } from 'react';
import { Handle } from 'reactflow';
import Dropzone from 'react-dropzone';
import ImageUpload from '../subcomponents/ImageUpload';

class ImageInputNode extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            image: null,
        };
        this.handleImageChange = this.handleImageChange.bind(this);
    }

    handleImageChange(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            this.setState({ image: reader.result });
            this.props.setNodes((nodes) => {
                nodes.find((node) => node.id === this.props.id).data.image = reader.result;
                return nodes;
            });
        };
        reader.readAsDataURL(file);
    }

    render() {
        return (
            <div className="react-flow__node-input">
                <ImageUpload> </ImageUpload>
                <Handle type="source" position="right" id="a" isConnectable={true} />
            </div>
        );
    }
}

export default ImageInputNode;
