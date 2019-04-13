
class vwbata {

    DOMTYPE = {
      'graphName': {'type':'input_box', 'title': 'Graph name', 'value':'name'},
      'edgeName': {'type':'input_box', 'title': 'Edge name', 'value':'id'},
      'dataName': {'type':'input_box', 'title': 'Data name', 'value':'name'},
      'toolName': {'type':'input_box', 'title': 'Tool name', 'value':'name'},
      'toolType': {'type': 'dropdown', 'title': 'Tool type', 'value':[],'label':[]},
      'editElem': {'position': 'divfoot', 'type':'light_button', 'title': 'Edit properties', 'value':'', 'event':{'onclick':"[[DIAGRAM]].editelem([[id]])"}},
      'removeElem': {'position': 'divfoot', 'type':'light_button', 'title': 'Remove element', 'value':'',
                'event':{'onclick':"[[DIAGRAM]].removeelem([[id]]);[[INTERFACE]].after_removing();"}}
    }

    OVERVIEW_SECTION = "graphName-editElem";
    INFO_SECTION = { tool: "toolName-toolType-editElem-removeElem", data:"dataName-editElem-removeElem", edge: "edgeName-removeElem"};

    info_section_html = "";
    overview_section_html = "";
    eventdom = {};

    __set__info_section_html(param){
      this.info_section_html = param;
    }

    __set__overview_section_html(param){
      this.overview_section_html = param;
    }

    constructor(config_file, diagram_instance,interface_instance) {
        this.DIAGRAM_INSTANCE = diagram_instance;
        this.INTERFACE_INSTANCE = interface_instance;

        //define the dom ids
        this.NAV_INFO = document.getElementById('nav_info_a');
        this.NAV_OVERVIEW = document.getElementById('nav_overview_a');
        this.CONTROL_CONTAINER = document.getElementById('control_body');
        this.ADD_TOOL = document.getElementById('add_tool');
        this.ADD_DATA = document.getElementById('add_data');

        //Construct the DOM types
        if (config_file.hasOwnProperty('tool')) {
          for (var k_tool in config_file.tool) {
            this.DOMTYPE.toolType.value.push(k_tool);
            this.DOMTYPE.toolType.label.push(config_file.tool[k_tool].label);
          }
        }

        //this.build_overview();
    }

    init_nav() {
      this.NAV_OVERVIEW.setAttribute("href", "javascript:vw_interface.click_overview_nav()");
      this.NAV_INFO.setAttribute("href", "javascript:vw_interface.click_info_nav()");
    }

    __get__add_tool_container(){
      return this.ADD_TOOL;
    }

    __get__add_data_container(){
      return this.ADD_DATA;
    }

    get_tools() {
        var all_tools = [];
        for (var i = 0; i < nodes.length; i++) {
          if(nodes[i].type == 'tool'){
            all_tools.push(nodes[i]);
          }
        }
        return all_tools;
    }

    build_overview(node_general) {
      //first decide what doms should be visualized (defined in DOMTYPE)
      var dom_key = this.OVERVIEW_SECTION;
      this.overview_section_html = this._build_section(dom_key, node_general);
    }

    build_info(elem) {
      //first decide what doms should be visualized (defined in DOMTYPE)
      var dom_key = this.INFO_SECTION[elem.type];
      this.info_section_html = this._build_section(dom_key, elem);
    }

    _build_section(dom_key, node){

      this.eventdom = {};
      //now populate the html page
      //first the body
      var domfoot_key_arr = [];
      var str_html= "";
      var dom_key_arr = dom_key.split("-");
      for (var i = 0; i < dom_key_arr.length; i++) {
        var obj_dom = this.DOMTYPE[dom_key_arr[i]];
        obj_dom['id'] = dom_key_arr[i];
        if (obj_dom.event != undefined) {
            this.eventdom[dom_key_arr[i]] = this.__normalize_eventdom(obj_dom,node);
        }
        if (obj_dom.position != 'divfoot') {
          str_html = str_html + this.__build_corresponding_dom(obj_dom, node);
        }else {
          domfoot_key_arr.push(obj_dom);
        }
      }

      //now the foot
      str_html = str_html + '<div id="control_foot">';
      for (var i = 0; i < domfoot_key_arr.length; i++) {
        var obj_dom = domfoot_key_arr[i];
        str_html = str_html + this.__build_corresponding_dom(obj_dom, node);
      }
      str_html = str_html + '</div>';

      return str_html;
    }
    __normalize_eventdom(obj_dom, node){
      var res_dom = JSON.parse(JSON.stringify(obj_dom));
      for (var k_event_type in obj_dom.event) {
        var event_func = obj_dom.event[k_event_type];

        var arr_regex = [/\[\[(DIAGRAM)\]\]/g,/\[\[(INTERFACE)\]\]/g,/\[\[(.*)\]\]/g]
        var str = event_func;
        for (var i = 0; i < arr_regex.length; i++) {
          var param = this.apply_regex(arr_regex[i],str);
          if (param != null) {
                str = str.replace("[["+param+"]]","");
                var replacer = "";
                if (param == "DIAGRAM") {
                  replacer = this.DIAGRAM_INSTANCE;
                }else if (param == "INTERFACE") {
                  replacer = this.INTERFACE_INSTANCE;
                }else{
                  replacer = "'"+node[param]+"'";
                }
                res_dom.event[k_event_type] = res_dom.event[k_event_type].replace("[["+param+"]]",replacer);
            }
        }
      }
      return res_dom;
    }
    __build_corresponding_dom(obj_dom_type, node){
      var str_html= "";

      //check if there is an event handler for the dom
      var str_html_event = "";
      if(obj_dom_type.id in this.eventdom){
        var event_obj = this.eventdom[obj_dom_type.id].event;
        for (var k_event in event_obj) {
          str_html_event = str_html_event+' '+k_event+'="'+event_obj[k_event]+'"';
        }
      }

      switch (obj_dom_type.type) {
        case 'dropdown':
              var str_options = "";
              for (var j = 0; j < obj_dom_type.value.length; j++) {
                var opt_val = obj_dom_type.value[j];
                var opt_lbl = obj_dom_type.label[j];
                var selected_val = "";
                if (opt_val == node.value) {
                  selected_val = "selected";
                }
                str_options = "<option value='"+opt_val+"' "+selected_val+">"+opt_lbl+"</option>"+str_options;

              };
              str_html = str_html + `
              <div class="input-group">
                    <div class="input-group-prepend">
                      <label class="input-group-text">`+obj_dom_type.title+`</label>
                    </div>
                    <select `+str_html_event+` id="`+obj_dom_type.id+`" class="val-box custom-select `+obj_dom_type.type+`" disabled>`+str_options+`</select>
              </div>
              `;
        break;
        case 'input_box':
          str_html = str_html + `
          <div class="input-group">
            <div class="input-group-prepend">
              <label class="input-group-text">`+obj_dom_type.title+`</label>
            </div>
            <input `+str_html_event+` id="`+obj_dom_type.id+`" class="val-box `+obj_dom_type.type+`" value="`+node[obj_dom_type.value]+`" type="text" disabled></input>
          </div>
          `;
        break;
        case 'light_button':
          str_html = str_html + '<span><button '+str_html_event+' id="'+obj_dom_type.id+'" type="button" class="btn btn-light '+obj_dom_type.type+'">'+obj_dom_type.title+'</button></span>';
          break;
      }

      return str_html;
    }

    __get__eventdom_containers(){
      var containers = [];
      for (var k_eventelem in this.eventdom) {
        containers.push(document.getElementById(this.eventdom[k_eventelem].id));
      }
      return containers;
    }

    click_on_node(node){
      this.build_info(node);
      this.click_info_nav();
    }

    click_on_edge(edge){
      this.build_info(edge);
      this.click_info_nav();
    }

    click_info_nav() {
      this.switch_nav('nav_info');
      this.CONTROL_CONTAINER.innerHTML = this.info_section_html;
    }

    after_removing(){
      this.__set__info_section_html("");
      this.click_overview_nav();
    }

    click_overview_nav() {
      this.switch_nav('nav_overview');
      this.CONTROL_CONTAINER.innerHTML = this.overview_section_html;
    }

    switch_nav(nav_node_id) {
      for (var i = 0; i < document.getElementsByClassName('nav-btn').length; i++) {
        var obj = document.getElementsByClassName('nav-btn')[i];
        if(obj.id == nav_node_id){
          document.getElementsByClassName('nav-btn')[i].className = "nav-btn active";
        }else {
          document.getElementsByClassName('nav-btn')[i].className = "nav-btn";
        }
      }
    }

    apply_regex(regex,str){
      let m;
      var param = null;
      while ((m = regex.exec(str)) !== null) {
          if (m.index === regex.lastIndex) {
              regex.lastIndex++;
          }
          // The result can be accessed through the `m`-variable.
          m.forEach((match, groupIndex) => {
              param = m[groupIndex];
          });

          if (param != null) {
            break;
          }
    }
    return param;
  }
}
