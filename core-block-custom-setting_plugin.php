<?php
/**
 * Plugin Name: Core Block Custom Setting
 * Description: Adds a custom Text Shadow setting to the core paragraph block.
 * Version: 1.0.0
 * Author: AlAmin
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // সরাসরি এক্সেস বন্ধ করার জন্য
}

if ( ! class_exists( 'Core_Block_Custom_Setting_Plugin' ) ) {
    class Core_Block_Custom_Setting_Plugin {
        
        public function __construct() {
            add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );
            add_filter( 'render_block_core/paragraph', array( $this, 'render_paragraph_block' ), 10, 2 );
        }
        
        // এডিটরে জাভাস্ক্রিপ্ট এবং সিএসএস লোড করা
        public function enqueue_editor_assets() {
            $asset_file_path = plugin_dir_path( __FILE__ ) . 'build/index.asset.php';
            
            if ( file_exists( $asset_file_path ) ) {
                $asset_file = include $asset_file_path;
                
                wp_enqueue_script(
                    'my-block-extension-js',
                    plugin_dir_url( __FILE__ ) . 'build/index.js',
                    $asset_file['dependencies'],
                    $asset_file['version']
                );
                
                wp_enqueue_style(
                    'my-block-extension-css',
                    plugin_dir_url( __FILE__ ) . 'build/style-index.css',
                    array(),
                    $asset_file['version']
                );
            }
        }
        
        // PHP এর মাধ্যমে ফ্রন্টএন্ড আউটপুটে স্টাইল ও ক্লাস যুক্ত করা
        public function render_paragraph_block( $block_content, $block ) {
            if ( isset( $block['attrs']['textShadow'] ) && is_array( $block['attrs']['textShadow'] ) && ! empty( $block['attrs']['textShadow'] ) ) {
                $shadow_rules = array();
                foreach ( $block['attrs']['textShadow'] as $layer ) {
                    $h_offset = isset( $layer['hOffset'] ) && $layer['hOffset'] !== '' ? $layer['hOffset'] : '0px';
                    $v_offset = isset( $layer['vOffset'] ) && $layer['vOffset'] !== '' ? $layer['vOffset'] : '0px';
                    $blur     = isset( $layer['blur'] ) && $layer['blur'] !== '' ? $layer['blur'] : '0px';
                    $color    = isset( $layer['color'] ) && $layer['color'] !== '' ? $layer['color'] : '#7090b0';
                    
                    $shadow_rules[] = sprintf( '%s %s %s %s', $h_offset, $v_offset, $blur, $color );
                }
                
                $shadow_css = implode( ', ', $shadow_rules );
                
                if ( ! empty( $shadow_css ) ) {
                    if ( class_exists( 'WP_HTML_Tag_Processor' ) ) {
                        $tags = new WP_HTML_Tag_Processor( $block_content );
                        if ( $tags->next_tag( array( 'tag_name' => 'p' ) ) ) {
                            // Add custom class
                            $tags->add_class( 'has-text-shadow' );
                            
                            // Add inline styling
                            $existing_style = $tags->get_attribute( 'style' );
                            $new_style = 'text-shadow: ' . $shadow_css . ';' . ( $existing_style ? ' ' . $existing_style : '' );
                            $tags->set_attribute( 'style', $new_style );
                        }
                        $block_content = $tags->get_updated_html();
                    } else {
                        // Fallback for older WordPress versions
                        $block_content = preg_replace(
                            '/<p /',
                            '<p class="has-text-shadow" style="text-shadow: ' . esc_attr( $shadow_css ) . ';" ',
                            $block_content,
                            1
                        );
                    }
                }
            }
            return $block_content;
        }
    }
    
    new Core_Block_Custom_Setting_Plugin();
}
