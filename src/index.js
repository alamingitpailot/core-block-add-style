import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, Button, PanelRow, ButtonGroup, Dropdown } from '@wordpress/components';
import { __experimentalUnitControl as UnitControl } from '@wordpress/components';
import { ColorPalette } from '@wordpress/block-editor';
import { useState } from '@wordpress/element';

import './style.scss';

// ১. নতুন Attribute রেজিস্টার করা
function addCustomAttribute(settings, name) {
    if (name !== 'core/paragraph') return settings;
    
    settings.attributes = Object.assign(settings.attributes || {}, {
        textShadow: {
            type: 'array',
            default: [],
        }
    });
    return settings;
}
addFilter('blocks.registerBlockType', 'core-block-custom-setting/add-attr', addCustomAttribute);

// ShadowControl Component (JSX React based on BPL design)
function ShadowControl({ label = 'Text Shadow', value = [], onChange }) {
    const [activeIndex, setActiveIndex] = useState(0);

    const defaultVal = [{
        hOffset: '0px',
        vOffset: '0px',
        blur: '0px',
        color: '#7090b0'
    }];

    const shadow = (value && value.length) ? value : defaultVal;

    const updateShadow = (property, val) => {
        const newShadow = shadow.map((s, index) => {
            if (index === activeIndex) {
                return { ...s, [property]: val };
            }
            return s;
        });
        onChange(newShadow);
    };

    const duplicateShadow = (e) => {
        e.preventDefault();
        const newShadow = [
            ...shadow.slice(0, activeIndex),
            { ...shadow[activeIndex] },
            ...shadow.slice(activeIndex)
        ];
        onChange(newShadow);
        setActiveIndex(activeIndex + 1);
    };

    const removeShadow = (e) => {
        e.preventDefault();
        const newShadow = [
            ...shadow.slice(0, activeIndex),
            ...shadow.slice(activeIndex + 1)
        ];
        onChange(newShadow);
        setActiveIndex(activeIndex === 0 ? 0 : activeIndex - 1);
    };

    const currentShadow = shadow[activeIndex] || {};
    const {
        hOffset = '0px',
        vOffset = '0px',
        blur = '0px',
        color = '#7090b0'
    } = currentShadow;

    return (
        <PanelRow className="bpl-shadow-control-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontWeight: '500' }}>{label}</label>
            <Dropdown
                className="bpl-shadow-dropdown"
                popoverProps={{ placement: 'bottom-end' }}
                renderToggle={({ isOpen, onToggle }) => (
                    <Button
                        icon="edit"
                        isSecondary
                        onClick={() => {
                            onToggle();
                            setActiveIndex(0);
                        }}
                        aria-expanded={isOpen}
                    />
                )}
                renderContent={() => (
                    <div className="bpl-shadow-popover-content" style={{ padding: '15px', width: '260px' }}>
                        {shadow.length > 1 && (
                            <PanelRow style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
                                <label style={{ fontWeight: '500', fontSize: '11px', textTransform: 'uppercase', color: '#757575' }}>
                                    Shadow Layer:
                                </label>
                                <ButtonGroup>
                                    {shadow.map((_, index) => (
                                        <Button
                                            key={index}
                                            isPrimary={activeIndex === index}
                                            isSecondary={activeIndex !== index}
                                            isSmall
                                            onClick={() => setActiveIndex(index)}
                                        >
                                            {index + 1}
                                        </Button>
                                    ))}
                                </ButtonGroup>
                            </PanelRow>
                        )}
                        <PanelRow style={{ marginBottom: '10px' }}>
                            <UnitControl
                                label="Horizontal Offset:"
                                labelPosition="left"
                                value={hOffset}
                                onChange={(val) => updateShadow('hOffset', val)}
                                units={['px', 'em', 'rem']}
                            />
                        </PanelRow>
                        <PanelRow style={{ marginBottom: '10px' }}>
                            <UnitControl
                                label="Vertical Offset:"
                                labelPosition="left"
                                value={vOffset}
                                onChange={(val) => updateShadow('vOffset', val)}
                                units={['px', 'em', 'rem']}
                            />
                        </PanelRow>
                        <PanelRow style={{ marginBottom: '10px' }}>
                            <UnitControl
                                label="Blur:"
                                labelPosition="left"
                                value={blur}
                                onChange={(val) => updateShadow('blur', val)}
                                units={['px', 'em', 'rem']}
                            />
                        </PanelRow>
                        <div className="bpl-color-section" style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '12px' }}>
                                Color:
                            </label>
                            <ColorPalette
                                value={color}
                                onChange={(val) => updateShadow('color', val)}
                                clearable={false}
                            />
                        </div>
                        <PanelRow className="itemAction" style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px', justifyContent: 'space-between' }}>
                            {shadow.length > 1 ? (
                                <Button isDestructive isLink onClick={removeShadow}>
                                    Remove
                                </Button>
                            ) : <div />}
                            <Button isSecondary isSmall icon="copy" onClick={duplicateShadow}>
                                Duplicate
                            </Button>
                        </PanelRow>
                        <div style={{ marginTop: '10px', textAlign: 'center' }}>
                            <Button
                                isSecondary
                                isSmall
                                icon="plus"
                                style={{ width: '100%' }}
                                onClick={() => {
                                    onChange([...shadow, { ...defaultVal[0] }]);
                                    setActiveIndex(shadow.length);
                                }}
                            >
                                Add Layer
                            </Button>
                        </div>
                    </div>
                )}
            />
        </PanelRow>
    );
}

// ২. Inspector Panel-এ শ্যাডো অপশনস যুক্ত করা
const withCustomSettings = createHigherOrderComponent((BlockEdit) => {
    return (props) => {
        if (props.name !== 'core/paragraph') {
            return <BlockEdit {...props} />;
        }

        return (
            <>
                <BlockEdit {...props} />
                <InspectorControls>
                    <PanelBody title="Custom Styles" initialOpen={true}>
                        <ShadowControl
                            label="Text Shadow"
                            value={props.attributes.textShadow}
                            onChange={(val) => props.setAttributes({ textShadow: val })}
                        />
                    </PanelBody>
                </InspectorControls>
            </>
        );
    };
}, 'withCustomSettings');

addFilter('editor.BlockEdit', 'core-block-custom-setting/add-ui', withCustomSettings);

// ৩. এডিটরের ভেতরে লাইভ প্রিভিউ দেখানোর জন্য inline style যুক্ত করা
const withCustomEditorClass = createHigherOrderComponent((BlockListBlock) => {
    return (props) => {
        if (props.name !== 'core/paragraph') {
            return <BlockListBlock {...props} />;
        }

        const textShadow = props.attributes && props.attributes.textShadow;

        if (textShadow && textShadow.length) {
            const shadowCss = textShadow.map((s) => {
                const h = s.hOffset || '0px';
                const v = s.vOffset || '0px';
                const b = s.blur || '0px';
                const c = s.color || '#7090b0';
                return `${h} ${v} ${b} ${c}`;
            }).join(', ');

            if (shadowCss) {
                const wrapperProps = { ...props.wrapperProps };
                wrapperProps.style = {
                    ...wrapperProps.style,
                    textShadow: shadowCss
                };
                wrapperProps.className = (wrapperProps.className ? wrapperProps.className + ' ' : '') + 'has-text-shadow';
                return <BlockListBlock {...props} wrapperProps={wrapperProps} />;
            }
        }

        return <BlockListBlock {...props} />;
    };
}, 'withCustomEditorClass');

addFilter('editor.BlockListBlock', 'core-block-custom-setting/add-editor-class', withCustomEditorClass);
