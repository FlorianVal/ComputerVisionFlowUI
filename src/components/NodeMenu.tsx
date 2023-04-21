import { DownOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { ControlButton } from 'reactflow';
import { nodeTitles } from '../ressources/nodeTypes';
import React from 'react';

function MenuDropdown() {
    const createNodeTypeList = () => {
        return Object.entries(nodeTitles).map(([key, value], index) => {
            return {
                label: (
                    <div
                        draggable
                        onDragStart={(event) => onDragStart(event, key)}
                    >
                        {value}
                    </div>
                ),
                key: index.toString(),
            };
        });
    };

    const items = createNodeTypeList();

    const onDragStart = (event : any, nodeType : string) => {
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
            <div onClick={(e) => e.preventDefault()}>
                <ControlButton>
                    <div>
                        +
                    </div>
                    <DownOutlined />
                </ControlButton>
            </div>
        </Dropdown>
    );
};

export default MenuDropdown;