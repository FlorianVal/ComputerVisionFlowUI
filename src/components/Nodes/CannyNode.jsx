import React, { memo } from 'react';
import { Handle } from 'reactflow';
import { Slider } from 'antd';

class CannyNode extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            slider1: 50,
            slider2: 50,
            stepper: 3,
        };
        this.handleSlider1Change = this.handleSlider1Change.bind(this);
        this.handleSlider2Change = this.handleSlider2Change.bind(this);
        this.handleStepperChange = this.handleStepperChange.bind(this);


    }

    handleSlider1Change(event) {
        this.setState({ slider1: event });
        // Check if props has setNodes
        if (!this.props.setNodes) {
            return;
        }
        this.props.setNodes((nodes) => {
            nodes.find((node) => node.id === this.props.id).data.slider1 = event;
            return nodes;
        });
    }

    handleSlider2Change(event) {
        this.setState({ slider2: event });
        // Check if props has setNodes
        if (!this.props.setNodes) {
            return;
        }
        this.props.setNodes((nodes) => {
            nodes.find((node) => node.id === this.props.id).data.slider2 = event;
            return nodes;
        });
    }

    handleStepperChange(event) {
        this.setState({ stepper: event });
        // Check if props has setNodes
        if (!this.props.setNodes) {
            return;
        }
        this.props.setNodes((nodes) => {
            nodes.find((node) => node.id === this.props.id).data.stepper = event;
            return nodes;
        });
    }

    render() {
        return (
            <div className="react-flow__node-input">
                <Handle type="target" position="left" id="input" isConnectable={true} />
                <div className="canny-node-slider-label">Threshold 1</div>
                <Slider min={0} max={1000} value={this.state.slider1} onChange={this.handleSlider1Change} className="nodrag" />
                <div className="canny-node-slider-label">Threshold 2</div>
                <Slider min={0} max={1000} value={this.state.slider2} onChange={this.handleSlider2Change} className="nodrag" />
                <div className="canny-node-slider-label">Aperture size</div>
                <Slider min={3} max={7} value={this.state.stepper} onChange={this.handleStepperChange} step={2}
                    marks={{
                        3: '3',
                        5: '5',
                        7: '7',
                    }}
                    included={false}
                    className="nodrag" />


                <Handle type="source" position="right" id="output" isConnectable={true} />
            </div >
        );
    }
}

export default memo(CannyNode);