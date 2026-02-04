
/*
Code for Import https://scriptui.joonas.me — (Triple click to select): 
{"activeId":5,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"Dlg","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"text":"Live paint suppoter","preferredSize":[0,0],"margins":16,"orientation":"column","spacing":10,"alignChildren":["fill","top"]}},"item-1":{"id":1,"type":"Panel","parentId":0,"style":{"enabled":true,"varName":"ObjPanel","creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["fill","top"],"alignment":null}},"item-2":{"id":2,"type":"Button","parentId":1,"style":{"enabled":true,"varName":"m_BtnStartLivePint","text":"Srtart live paint","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-3":{"id":3,"type":"EditText","parentId":1,"style":{"enabled":true,"varName":"m_SelectedGrText","creationProps":{"noecho":false,"readonly":true,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"Not selected","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-4":{"id":4,"type":"Button","parentId":0,"style":{"enabled":true,"varName":"m_BtnColorPicker","text":"Color picker tool","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-5":{"id":5,"type":"Button","parentId":0,"style":{"enabled":true,"varName":"m_BtnLivePaint","text":"Live point tool","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-6":{"id":6,"type":"Button","parentId":0,"style":{"enabled":true,"varName":"m_BtnCancel","text":"Close","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}}},"order":[0,1,2,3,4,5,6],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":false,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
*/ 

// DLG
// ===
var Dlg = new Window("dialog"); 
    Dlg.text = "Live paint suppoter"; 
    Dlg.orientation = "column"; 
    Dlg.alignChildren = ["fill","top"]; 
    Dlg.spacing = 10; 
    Dlg.margins = 16; 

// OBJPANEL
// ========
var ObjPanel = Dlg.add("panel", undefined, undefined, {name: "ObjPanel"}); 
    ObjPanel.orientation = "column"; 
    ObjPanel.alignChildren = ["fill","top"]; 
    ObjPanel.spacing = 10; 
    ObjPanel.margins = 10; 

var m_BtnStartLivePint = ObjPanel.add("button", undefined, undefined, {name: "m_BtnStartLivePint"}); 
    m_BtnStartLivePint.text = "Srtart live paint"; 

var m_SelectedGrText = ObjPanel.add('edittext {properties: {name: "m_SelectedGrText", readonly: true}}'); 
    m_SelectedGrText.text = "Not selected"; 

// DLG
// ===
var m_BtnColorPicker = Dlg.add("button", undefined, undefined, {name: "m_BtnColorPicker"}); 
    m_BtnColorPicker.text = "Color picker tool"; 

var m_BtnLivePaint = Dlg.add("button", undefined, undefined, {name: "m_BtnLivePaint"}); 
    m_BtnLivePaint.text = "Live point tool"; 

var m_BtnCancel = Dlg.add("button", undefined, undefined, {name: "m_BtnCancel"}); 
    m_BtnCancel.text = "Close"; 

