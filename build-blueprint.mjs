import fs from 'node:fs';
const pages = fs.existsSync('content.json') ? JSON.parse(fs.readFileSync('content.json','utf8')) : Object.fromEntries(['Home','Services','Approach','About','Notes','Contact'].map(title=>[title,'<!-- wp:paragraph --><p>Demo content is being prepared.</p><!-- /wp:paragraph -->']));
const css=fs.readFileSync('site.css','utf8');
const php=`<?php
require '/wordpress/wp-load.php';
$pages=json_decode(base64_decode('${Buffer.from(JSON.stringify(pages)).toString('base64')}'),true);
$ids=[];
foreach($pages as $title=>$content){$slug=strtolower($title);$content=str_replace('href="/','href="'.home_url('/'),$content);$existing=get_page_by_path($slug);$id=wp_insert_post(['ID'=>$existing?$existing->ID:0,'post_type'=>'page','post_status'=>'publish','post_title'=>$title,'post_name'=>$slug,'post_content'=>$content],true);if(is_wp_error($id)){throw new Exception($id->get_error_message());}$ids[$title]=$id;update_post_meta($id,'_kad_post_layout','fullwidth');update_post_meta($id,'_kad_post_style','unboxed');update_post_meta($id,'_kad_post_title','hide');}
update_option('show_on_front','page');update_option('page_on_front',$ids['Home']);update_option('blogname','Fieldnote.');update_option('blogdescription','Clarity for your next stage.');update_option('permalink_structure','/%postname%/');update_option('default_comment_status','closed');
$menu=wp_get_nav_menu_object('Demo navigation');$menu_id=$menu?$menu->term_id:wp_create_nav_menu('Demo navigation');if(!wp_get_nav_menu_items($menu_id)){foreach(['Services','Approach','About','Notes','Contact'] as $title){wp_update_nav_menu_item($menu_id,0,['menu-item-title'=>$title,'menu-item-object'=>'page','menu-item-object-id'=>$ids[$title],'menu-item-type'=>'post_type','menu-item-status'=>'publish']);}}
set_theme_mod('nav_menu_locations',['primary'=>$menu_id,'mobile'=>$menu_id]);
foreach(get_posts(['post_type'=>'post','numberposts'=>-1]) as $post){if($post->post_title==='Hello world!'){wp_delete_post($post->ID,true);}}
flush_rewrite_rules();echo json_encode(['pages'=>$ids,'theme'=>wp_get_theme()->get('Version'),'wordpress'=>get_bloginfo('version')]);
`;
const plugin=`<?php
/* Plugin Name: Fieldnote Demonstration Styles */
add_action('wp_head',function(){echo '<style id="fieldnote-style">'.file_get_contents(ABSPATH.'wp-content/fieldnote.css').'</style>';},100);
add_action('wp_footer',function(){echo '<div class="fn-demo-notice">Independent WordPress / Kadence demonstration by GenesisOne. Fieldnote is fictional; no client relationship or business results are claimed.</div>';});
`;
const blueprint={
 $schema:'https://playground.wordpress.net/blueprint-schema.json',meta:{title:'Fieldnote — Kadence consultancy demo',author:'GenesisOnee',description:'Six editable pages using Kadence Theme and Kadence Blocks. A fictional portfolio sample, not a client delivery.'},
 preferredVersions:{php:'8.3',wp:'7.1.4'},features:{networking:true},login:true,landingPage:'/',steps:[
 {step:'defineWpConfigConsts',consts:{DISABLE_WP_CRON:true,AUTOMATIC_UPDATER_DISABLED:true}},
 {step:'installTheme',themeData:{resource:'url',url:'https://downloads.wordpress.org/theme/kadence.1.6.0.zip'},options:{activate:true}},
 {step:'installPlugin',pluginData:{resource:'url',url:'https://downloads.wordpress.org/plugin/kadence-blocks.3.9.0.zip'},options:{activate:true}},
 {step:'setSiteOptions',options:{blogname:'Fieldnote.',blogdescription:'Clarity for your next stage.',default_comment_status:'closed'}},
 {step:'runPHP',code:"<?php if(!is_dir('/wordpress/wp-content/mu-plugins'))mkdir('/wordpress/wp-content/mu-plugins',0777,true);"},
 {step:'writeFile',path:'/wordpress/wp-content/mu-plugins/fieldnote-demo.php',data:plugin},
 {step:'writeFile',path:'/wordpress/wp-content/fieldnote.css',data:css},
 {step:'runPHP',code:php}
 ]
};
fs.writeFileSync('blueprint.json',JSON.stringify(blueprint,null,2));
console.log(JSON.stringify({pages:Object.keys(pages),hasFinalContent:fs.existsSync('content.json'),wordpress:'7.1.4',php:'8.3',kadence:'1.6.0',blocks:'3.9.0'}));
