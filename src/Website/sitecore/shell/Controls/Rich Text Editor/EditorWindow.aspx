<%@ Page Language="C#" AutoEventWireup="true" Inherits="Sitecore.Shell.Applications.ContentManager.EditorWindowPage" Codebehind="EditorWindow.aspx.cs" %>
<%@ Register TagPrefix="telerik" Namespace="Telerik.Web.UI" Assembly="Telerik.Web.UI" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
<title>Sitecore</title>
  <script src="/sitecore/shell/controls/lib/prototype/prototype.js" type="text/javascript"></script>
  <script type="text/javascript">
    var currentKey = null;
    var windowWidth = null;
    var windowHeight = null;
    var isMaximized = null;

    function fixRadWindowMinWidth(radWindow) {
      var id = "RadWindowWrapper_MainWindow";
      var mainWindow = document.getElementById(id);
      mainWindow.style.minWidth = "800px";
      radWindow.center();
    }

    function scClientClose() {
      var w = $find("MainWindow");
      windowWidth = w.GetWidth();
      windowHeight = w.GetHeight();
      isMaximized = w.IsMaximized();

      $(window.frameElement).hide();
    }

    function scLoad(url, key, html) {
      var w = $find("MainWindow");

      if (key == currentKey) {
        var f = w.GetContentFrame();

        f.contentWindow.scRichText.setText(html);
        w.show();
        scResizeWindow(w);
        f.contentWindow.scRichText.setFocus();
        return;
      }

      currentKey = key;
      scResizeWindow(w);
      w.show();

      fixRadWindowMinWidth(w);

      w.setUrl(url);
    }

    function scResizeWindow(w) {
      if (windowWidth == null) {
       return;
      }

      // w.SetSize(windowWidth, windowHeight);

      if (isMaximized) {
        w.Maximize();
      }
    }

  </script>
</head>
<body style="background:transparent">
  <form id="form1" runat="server">
    <telerik:RadScriptManager ID="RadScriptManager" runat="server"></telerik:RadScriptManager>

    <asp:UpdatePanel ID="UpdatePanel" runat="server">
      <ContentTemplate>
        <telerik:RadFormDecorator ID="RadFormDecorator" runat="server" />

        <telerik:RadWindowManager ShowContentDuringLoad="false" VisibleStatusbar="false" runat="server" >
          <Windows>
            <telerik:RadWindow ID="MainWindow" Behaviors="Resize,Move,Close,Maximize" runat="server" KeepInScreenBounds="true" Width="800" Height="600" Modal="true" ReloadOnShow="false" Skin="Default" OnClientBeforeClose="scClientClose" />
          </Windows>
        </telerik:RadWindowManager>
      </ContentTemplate>
    </asp:UpdatePanel>
  </form>
</body>
</html>