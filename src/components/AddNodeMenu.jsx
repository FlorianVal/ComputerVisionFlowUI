import { DownOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { ControlButton } from 'reactflow';
import { nodeTitles } from '../ressources/nodeTypes';
import React from 'react';

const AddMenuDropdown = () => {
    const createNodeTypeList = () => {
        return Object.entries(nodeTitles).map(([key, value], index) => {
            return {
                label: (
                    <a
                        draggable
                        onDragStart={(event) => onDragStart(event, key)}
                    >
                        {value}
                    </a>
                ),
                key: index.toString(),
            };
        });
    };

    const items = createNodeTypeList();

    const onDragStart = (event, nodeType) => {
        console.log('onDragStart', nodeType);
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <Dropdown
            menu={{
                items: items,
            }}
            trigger={['click']}
            align={{ offset: [40, -20] }}
        >
            <a onClick={(e) => e.preventDefault()}>
                <ControlButton>
                    <div>
                        <font size="+2">+</font>
                    </div>
                    <DownOutlined />
                </ControlButton>
            </a>
        </Dropdown>
    );
};

export default AddMenuDropdown;
