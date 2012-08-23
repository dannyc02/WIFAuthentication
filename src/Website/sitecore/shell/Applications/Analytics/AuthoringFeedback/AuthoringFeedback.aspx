<%@ Page Language="C#" AutoEventWireup="false" CodeBehind="AuthoringFeedback.aspx.cs" Inherits="Sitecore.Shell.Applications.Analytics.AuthoringFeedback.AuthoringFeedbackPage" %>
<%@ Register Assembly="Stimulsoft.Report.Web" Namespace="Stimulsoft.Report.Web" TagPrefix="cc1" %>
<%@ register tagprefix="t" namespace="Telerik.Web.UI" assembly="Telerik.Web.UI" %>
<%@ register tagprefix="sc" namespace="Sitecore.Web.UI.HtmlControls" assembly="Sitecore.Kernel" %>
<%@ register tagprefix="ds" tagname="DateSelector" src="/sitecore/shell/Applications/Analytics/ReportRunner/DateSelector.ascx" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head runat="server">
  <title>Sitecore</title>
  <script src="/sitecore/shell/controls/lib/prototype/prototype.js" type="text/javascript"></script>
  <script language="javascript" type="text/javascript">
  
  function scOpenWindow(id) {
    window.open("/sitecore/shell/Applications/Analytics/SessionInformation/SessionInformation.aspx?sid=" + id, "_self");
  }
  
  </script>
</head>
<body>
  <form id="form1" runat="server" style="height:auto">
    <asp:scriptmanager id="ScriptManager" runat="server" />
    
    <table width="100%" height="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed">
      <tr>
        <td>
          <ds:DateSelector id="DateSelector" runat="server" />
        </td>
      </tr>
      <tr>
       <td height="100%">
         <cc1:stiwebviewer id="Viewer" runat="server" buttonimagespath="/sitecore/shell/Themes/Standard/Reports/" width="100%" height="100%" />
       </td>
      </tr>
    </table>

    <script language="javascript" type="text/javascript">
      var itemId = '<asp:placeholder runat=server id="ItemId" />';
      var reportFileName = "/sitecore/shell/Applications/Analytics/AuthoringFeedback/AuthoringFeedback.mrt";
    </script>

    <script language="javascript" type="text/javascript" src="/sitecore/shell/Applications/Analytics/ReportRunner/mailreport.js">
    </script>
  </form>
</body>
</html>
