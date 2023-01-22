import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Space } from 'antd';
import ReactFlow, {
    ControlButton,
} from 'reactflow';
import { nodeTypes, nodeTitles } from '../ressources/nodeTypes';
import React from 'react';

class AddMenuDropdown extends React.Component {
    constructor(props) {
        super(props);
        this.onDragStart = this.onDragStart.bind(this);
        this.createNodeTypeList = this.createNodeTypeList.bind(this);
        this.items = this.createNodeTypeList(nodeTypes);
    }

    createNodeTypeList() {
        return Object.entries(nodeTitles).map(([key, value], index) => {
            return {
                label: <a draggable onDragStart={(event) => this.onDragStart(event, key)}>{value}</a>,
                key: index.toString()
            }
        })
    }

    onDragStart(event, nodeType) {
        console.log('onDragStart', nodeType);
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    }

    render() {
        return (
            <Dropdown
                menu={{
                    items: this.items,
                }}
                trigger={['click']}
                align={{ offset: [40, -20] }}
            >
                <a onClick={(e) => e.preventDefault()}>
                    <ControlButton>
                        <div><font size="+2">+</font></div>
                        <DownOutlined />
                    </ControlButton>
                </a>
            </Dropdown >
        )
    }
}
export default AddMenuDropdown;
