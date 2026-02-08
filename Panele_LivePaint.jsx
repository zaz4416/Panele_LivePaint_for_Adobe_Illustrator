/*
<javascriptresource>
<name>ライブペイントのパネル</name>
</javascriptresource>
*/

// Ver.1.0 : 2026/02/08

#target illustrator
#targetengine "main"


// スクリプト実行時に外部のJSXを読み込む (#includeにすると、main関数が終了した時点で、ダイアログが表示されなくなる)
$.evalFile(GetScriptDir() + "ZazLib/PaletteWindow.jsx");
$.evalFile(GetScriptDir() + "ZazLib/SupprtFuncLib.jsx");

// 言語ごとの辞書を定義
var MyDictionary = {
    GUI_JSX: {
        en : "GUI/Panele_LivePaint/ScriptUI Dialog Builder - Export_EN.jsx",
        ja : "GUI/Panele_LivePaint/ScriptUI Dialog Builder - Export_JP.jsx"
    },

    Msg_start_live_paint: {
        en : "Start live paint",
        ja : "ライブペイント開始"
    },

    Msg_end_of_live_paint: {
        en : "End of live paint",
        ja : "ライブペイントを終了しました"
    }
};

// --- LangStringsの辞書から自動翻訳処理 ---
var LangStrings = GetWordsFromDictionary( MyDictionary );

// オブジェクトの最大保持数
var _MAX_INSTANCES = 5;


// --- グローバル関数 -----------------------------------------------------------------

/**
 * 実行中スクリプトの親フォルダ（Folderオブジェクト）を返す。
 * なお、戻り値の最後には/が付与される。
 */
function GetScriptDir() {
    var selfFile = null;
    try {
        selfFile = new File(decodeURI($.fileName || Folder.current.fullName));
    } catch (e) {
        return Folder.current.fullName.replace(/\/*$/, "/");
    }
    var dirPath = (selfFile !== null) ? selfFile.parent.fullName : Folder.current.fullName;

    // 末尾にスラッシュがなければ付与して返す
    return dirPath.replace(/\/*$/, "/");
}

// ---------------------------------------------------------------------------------

var DlgPaint;

// 最大色を定義
var cMaxColorLivePainr = 100;
alert( "お知らせ\n" + cMaxColorLivePainr + "まで、色を扱えます" );


//-----------------------------------
// クラス CLivePaintDLg
//-----------------------------------

// コンストラクタ    
function CLivePaintDLg( scriptName )
{
    CPaletteWindow.call( this, scriptName, _MAX_INSTANCES, false );      // コンストラクタ
    var self = this;
    
    self.m_Dialog.opacity       = 0.7; // （不透明度）
    self.StaticActiveDoc   = undefined;
    self.StaticActiveLayer = undefined;
    self.StaticSelection   = undefined;
    self.StaticGrName      = undefined;
    self.StaticFlagValue   = false;

    // GUI用のスクリプトを読み込む
    if ( self.LoadGUIfromJSX( GetScriptDir() + LangStrings.GUI_JSX ) )
    {
        // GUIに変更を入れる
        self.m_BtnStartLivePint.onClick  = function() { self.onStartLivePintClick(); }
        self.m_BtnColorPicker.onClick    = function() { self.onColorPickerClick(); }       
        self.m_BtnLivePaint.onClick      = function() { self.onLivePaintClick(); }        
        self.m_BtnCancel.onClick         = function() { self.onCancelClick(); }  

        self.m_BtnColorPicker.visible = false;
        self.m_BtnLivePaint.visible = false;

        // 最後に、新しいインスタンスを追加
        self.RegisterInstance();
    }
    else{
        alert("GUIが未定です");
        return;
    }
}

// クラス継承
ClassInheritance(CLivePaintDLg, CPaletteWindow);


// メソッド
// ・継承した後に、サブクラスのメソッド を個別に追加すること
 CLivePaintDLg.prototype.SetSelectedText = function( text ) {
    var self = this.GetGlobalDialog();
    self.m_SelectedGrText.text = text;
}

CLivePaintDLg.prototype.test =  function() { 
    $.writeln( "CLivePaintDLg::test()" );
}

CLivePaintDLg.prototype.IsLivePaintig =  function() {
    var self = this.GetGlobalDialog();
    if ( typeof self.StaticActiveDoc  !== "undefined" )
    {
        alert("ライプペイントを継続中です\nパスに変換して終了します。");
        this.CallFunc( ".EndOfLivePaint_Func()" );
    }
}



CLivePaintDLg.prototype.BeginLivePaint_Func = function()
{ 
    var  ProgressDlg = new Window ('palette', "処理中...", [0,0,300,60],{borderless:true});
    var self = this.GetGlobalDialog();
 
    try
    { 
        // バカ除け
        var result = confirm("ライブペイント開始しますか？");
        if ( !result ) throw new Error("");    // 何もしませんで関数を抜ける

        var objPb = ProgressDlg.add("progressbar", [20,20,270,40], 1, 100); 
		ProgressDlg.center();
		ProgressDlg.show();
        objPb.value = 100;
        ProgressDlg.update(); 

        // １つのグループが選択されているかを確認する
        if ( app.activeDocument.selection == 0 ) throw new Error("指示\nパスを含むグループを1づだけ選択してね");

        // 選択されているアイテムから、グループを選択する。選択されたグループが戻り値。
         var SrcGr = SetGroupBySelectionItem( );

         if ( SrcGr == undefined ) throw new Error("指示\nパスを含むグループを1づだけ選択してね");

        self.SetSelectedText( SrcGr.name );
        self.StaticGrName = SrcGr.name;
  
        // グループ化されていないパス、または、複合パスが含まれている場合、グループを追加してその中に全てのアイテムを移動させる
        if ( SrcGr.pathItems.length != 0  || SrcGr.compoundPathItems.length != 0 )
        { 
                 NewGp = SrcGr.groupItems.add();
                 app.redraw();
                 var SrcItem = SrcGr.pageItems;
                 var leng = SrcItem.length;
                    
                 // 最後 から 1番目 までアイテムをグループに移動
                 for(i=leng-1; i>=1; i--) if ( SrcItem[i].selected ) SrcItem[i].move(NewGp,ElementPlacement.PLACEATEND);
                 app.redraw();
        }

        // ライブペイントを開始する前に、指定したグループ内に、グループが1tつしか存在しない場合、グループを2個以上に増やす必要がある
        // そのための対策で、指定したグループに含まれているグループ内のアイテムを、ひとつだけグループ化して移動させる
        if ( SrcGr.groupItems.length == 1)
        {
                NewGp = SrcGr.groupItems.add();	
                app.redraw();
                var SrcGrX = SrcGr.pageItems[1].pageItems[0];
                var DisGrX = SrcGr.pageItems[0];
                MoveItems( SrcGrX, DisGrX );
         } 
 
        app.redraw();
        self.StaticActiveDoc    = app.activeDocument;
        self.StaticActiveLayer  = self.StaticActiveDoc .activeLayer; 
        self.StaticSelection    = self.StaticActiveDoc .selection;
        app.executeMenuCommand("Make Planet X");       // ライブペイント>作成
        app.redraw();
        app.selectTool('Adobe Planar Paintbucket Tool');     // ライブペイント選択ツールに切り替える
        self.m_BtnStartLivePint.text = "ライブペイント終了"; 
        self.StaticFlagValue = true;
        app.activeDocument.selection = [];
        
        if ( self.m_BtnColorPicker != undefined ) self.m_BtnColorPicker.visible = true;
        if ( self.m_BtnLivePaint   != undefined ) self.m_BtnLivePaint.visible   = true;

        alert("ライブペイントを使用できます\nライブペイントツールが選択され、\n選択されたグループのみを色塗りできます。");
    } // try
    catch(e)
    {
        ProgressDlg.close();
        if ( e.message != "" ) alert( e.message );
    } // catch
    finally
    {
        app.redraw();
    } // finally
    
    return true;
}


CLivePaintDLg.prototype.EndOfLivePaint_Func = function()
{  
    var ActiveLayer = activeDocument.activeLayer;         
	var  ProgressDlg = new Window ('palette', "処理中...", [0,0,300,60],{borderless:true});
    var self = this.GetGlobalDialog();
 
    try
    { 
            // バカ除け
            var result = confirm( "ライブペイントをパス化しますか？\nなお、パス化可能な最大色は" + cMaxColorLivePainr + "までです" );
            if ( !result ) throw new Error("");   // なにもしないで関数を抜ける
        
           // １つのグループが選択されているかを確認する
           if ( typeof self.StaticActiveDoc  === "undefined" ) throw new Error("エラー\nライブペイントがありません");

            // グループを選択する
            {                
                if ( self.StaticFlagValue  )
                {
                    // ライブペイント開始時に選択されたグループを使用する
                    app.activeDocument.selection   = self.StaticSelection;
                    app.activeDocument.activeLayer = self.StaticActiveLayer; 
                    // alert("お知らせ\nライブペイントを開始したときのグループを指定します");
                }
                else
                {
                    if ( typeof app.activeDocument.selection[0] === "undefined" ) throw new Error("エラー\n選択済みのグループがありません");
                    // alert("クリックしたグループを指定します");
                }
            }
 
            self.StaticFlagValue = false;
            app.redraw(); 

            if ( self.m_BtnColorPicker != undefined ) self.m_BtnColorPicker.visible = false;
            if ( self.m_BtnLivePaint   != undefined ) self.m_BtnLivePaint.visible   = false;
 
        var Gp ;
 
        // ライブペイントになっているグループを探し、拡張を行う
        {
            var Gxp = app.activeDocument.selection[0];
            while( Gxp.groupItems.length != 0) Gxp = Gxp.groupItems[0];
            app.executeMenuCommand("Expand Planet X");  // ライブペイント>拡張
            Gp = Gxp.groupItems[0];                     // ライブペイント>拡張にて、グループ化されたグループを取得
        }

        const TopGp = Gp;
		var objPb = ProgressDlg.add("progressbar", [20,20,270,40], 1, Gp.pageItems.length);
		ProgressDlg.center();
		ProgressDlg.show();

        var GrCount = 1;

        // パスの色ごとにグループ化
        while( Gp.pageItems.length > 0 && GrCount < cMaxColorLivePainr )
        {
            objPb.value = Gp.pageItems.length;
            ProgressDlg.update();

            GrCount = GrCount + 1;
            
            // グループを選択
            app.activeDocument.selection = TopGp;

            // 新規グループを追加      
            var NewGp = ActiveLayer.groupItems.add();			// グループを追加
            NewGp.move( TopGp, ElementPlacement.PLACEBEFORE );	// 追加したグループを選択位置に移動させる

            // パスが存在する場合、パスと同じ色のパスを選択し、グループに移動させる
            {
                app.activeDocument.selection = Gp.pageItems[0];             // グループ中の最初のアイテムを選択
                app.redraw();                                               // 再描画させる(必須)
                app.executeMenuCommand("Find Fill Color menu item");        // 共通>カラー(塗り)で、選択
                app.redraw();
                MoveItem( Gp.pageItems , NewGp ); 
                app.redraw();     
            }
        } // while

        if ( GrCount == cMaxColorLivePainr ) alert ( "警告\n" + cMaxColorLivePainr + "色以降のパスは切り捨てられます" );

        // 親がレイヤーでない場合に
        if( (Gp.parent.toString().indexOf(cKindOfLayer)) == -1 )
        {
            // パスファインダーでパスを統合する
            {
                const GpSrc = Gp.parent;
                const Length = GpSrc.pageItems.length;
                
                if ( Length >=2 )
                {
                    // [[ アイテムが２つ以上の場合に実施 ]]
                    var lp;
                    for ( lp=Length-1; lp>=0; lp-- )
                    {
                        ReShape( GpSrc, lp );
                            
                        if ( ! KindOfItem(GpSrc.pageItems[lp], cKindOfGroupItem) )
                        {
                            app.activeDocument.selection = GpSrc.pageItems[lp]; 
                            var NewGp = AddGroup( "<GpItem>" ); 
                            app.redraw();
                            MoveToGroup( NewGp );
                            app.redraw();
                        }
                    } // for
                }
                else
                {
                    // [[ アイテムが1つの場合に実施 ]]
                    ReShape( GpSrc, 0 );    // ← この時点で、グループに含まれないアイテムが、ひとつだけ存在している状態になる

                    var NewGp = AddGroup( self.StaticGrName );   // アイテムを入れるためのグループを作成する

                    var ActiveLayer = activeDocument.activeLayer;
                    var CoPathLrngth = ActiveLayer.compoundPathItems.length;
                    var PaPathLrngth = ActiveLayer.pathItems.length;

                    // 複合パスが存在する場合は、それをグループに入れる
                    if ( CoPathLrngth == 1 )
                    {
                        var CoPath = ActiveLayer.compoundPathItems[0];
                        CoPath.move(NewGp,ElementPlacement.PLACEATEND);
                    }
                    else
                    {
                        // パスが存在する場合は、それをグループに入れる 
                        if ( PaPathLrngth == 1 )
                        {   
                            var PaPath = ActiveLayer.pathItems[0];
                            PaPath.move(NewGp,ElementPlacement.PLACEATEND);
                        }
                    }

                    app.redraw();
                    //throw new Error("中止");
                }
            }

            // グループ移動
            {
                var GpSrc = Gp.parent;
                var GpDis = Gp.parent.parent; 
                var Length = GpSrc.pageItems.length;
                var lp1;
                var vCount = 1;
                
                for ( lp1=Length-1; lp1>=0; lp1-- )
                {
                var NewGp ;

                // 新規グループを追加
                {
                    var Name = "<Lv" + ('000000000' + vCount).slice(-3) + ">";;
                    NewGp = ActiveLayer.groupItems.add();
                    NewGp.name = Name;
                    NewGp.move( GpSrc, ElementPlacement.PLACEBEFORE );
                    app.redraw(); 
                }                 
                    
                    var SrcItem = GpSrc.pageItems[lp1];
                    var leng = SrcItem.pageItems.length;
    
                // 選択オブジェクトをグループ化
                for(i=leng-1; i>=0; i--) SrcItem.pageItems[i].move(NewGp,ElementPlacement.PLACEATEND);
                app.redraw();
                ++vCount;
                }
            }
        }

        self.SetSelectedText(" ");
        app.selectTool('Adobe Direct Select Tool');     // ダイレクト選択
        self.m_BtnStartLivePint.text = LangStrings.Msg_start_live_paint;
        app.activeDocument.selection = [];
        self.StaticActiveDoc  = undefined;
        self.StaticGrName = "";
        alert( LangStrings.Msg_end_of_live_paint) ;
    } // try
    catch(e)
    {
        if ( e.message != "" ) alert( e.message );
    } // catch
    finally
    {
      app.redraw();
      ProgressDlg.close(); 
    } // finally
 }


//~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 4. プロトタイプメソッドの定義
//~~~~~~~~~~~~~~~~~~~~~~~~~~~

CLivePaintDLg.prototype.onStartLivePintClick = function() {
    var self = this.GetGlobalDialog();
    try {
        if ( typeof self.StaticActiveDoc  === "undefined" ) {
            self.CallFunc( ".BeginLivePaint_Func()" );
        }
        else {
            self.CallFunc( ".EndOfLivePaint_Func()" );
        }
    }
    catch(e) {
        alert( e.message );
    } 
}

CLivePaintDLg.prototype.onColorPickerClick = function() {
    app.selectTool('Adobe Eyedropper Tool');        // スポイト
}

CLivePaintDLg.prototype.onLivePaintClick = function() {
    app.selectTool('Adobe Planar Paintbucket Tool');    // ライブペイント
}

CLivePaintDLg.prototype.onCancelClick = function() {
    var self = this.GetGlobalDialog();
    try
    {
        if ( typeof self.StaticActiveDoc  !== "undefined" )
        {
            alert("ライプペイントを継続中です\nパスに変換して終了します。");
            self.CallFunc( ".EndOfLivePaint_Func()" );
        }
        self.close();
    }
    catch(e)
    {
        alert( e.message );
    }
}


//----------------------------------------------------------------------
 function ReShape( GpSrc, lp )
 {
    app.activeDocument.selection = [];             
    GpSrc.pageItems[lp].selected = true;
    app.redraw();
    Pathfinder_Add();
    app.redraw();
 }

function MoveItems( SrcGrX, DisGrX )
{
    if ( SrcGrX.toString().indexOf(cKindOfGroupItem)  != -1 )
    {
          // 送り元がグループなので、その中のひとつをグループ化して移動させる
          SrcGrX.pageItems[0].move(DisGrX,ElementPlacement.PLACEATEND);   
    }
    else
    {
          // 送り元がパスなので、その中のひとつをグループ化して移動させる
          SrcGrX.move(DisGrX,ElementPlacement.PLACEATEND);    
    }
 }

 function Pathfinder_Add()
 { 
    // グループ内にパスを入れて、そこをセレクトさせてから、パスファインダーを実施させること！！
    //app.executeMenuCommand("group");
    app.executeMenuCommand("Live Pathfinder Add");
    app.executeMenuCommand("expandStyle");
    //app.executeMenuCommand("ungroup");
 
    // Add         Live Pathfinder Add		    追加
    // Subtract    Live Pathfinder Subtract		前面オブジェクトで型抜き
    // Intersect   Live Pathfinder Intersect	交差
    // Exclude     Live Pathfinder Exclude		中マド

    // Divide      Live Pathfinder Divide		分割
    // Trim        Live Pathfinder Trim		    刈り込み
    // Merge       Live Pathfinder Merge		合流
    // Crop        Live Pathfinder Crop		    切り抜き
    // Outline     Live Pathfinder Outline		アウトライ
    // Minus Back  Live Pathfinder Minus Back	背面オブジェクトで型抜き

    // Hard Mix    Live Pathfinder Hard Mix		濃い混色
    // Soft Mix    Live Pathfinder Soft Mix		薄い混色
    // Trap        Live Pathfinder Trap		    トラップ
 }
 

 function escExit(event) {
    if ( event.keyName === 'Escape' ) {
        alert( "終わります。" );
        DlgPaint.IsLivePaintig();
        DlgPaint.close();
    }
 }

 
main();

function main()
{ 
    // バージョン・チェック
    if( appVersion()[0]  >= 24)
    {
        // 実行中のスクリプト名を取得（拡張子なし）
        var scriptName = decodeURI(File($.fileName).name).replace(/\.[^\.]+$/, "");

        // 新しいインスタンスを生成
        var Obj  = new CLivePaintDLg( scriptName );
        //Obj.addEventListener( 'keydown',  escExit );

        // インデックスをタイトルの先頭に表示
        var Index = Obj.GetGlobalIndex();
        var Title = Obj.GetDialogTitle();
        Obj.SetDialogTitle( "[" + Index + "]" + Title );

        // インスタンスを表示
        Obj.show();
    }
    else
    {
         var msg = {en : 'This script requires Illustrator 2020 or later.', ja : 'このスクリプトは Illustrator 2020以降に対応しています。'} ;
        alert(msg) ; 
    }
}
