<%@ Page AutoEventWireup="true" Inherits="Sitecore.Shell.Applications.Media.UploadManager.ResultPage" Language="C#" %>
<%@ Register Assembly="Sitecore.Kernel" Namespace="Sitecore.Web.UI.HtmlControls" TagPrefix="sc" %>
<%@ Register Assembly="Sitecore.Kernel" Namespace="Sitecore.Web.UI.WebControls" TagPrefix="sc" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<html >
<head runat="server">
  <title>Sitecore</title>
  <sc:Head runat="server" />
  <sc:Script runat="server" Src="/sitecore/shell/Controls/Sitecore.Runtime.js"/>
  <sc:Script runat="server" Src="/sitecore/shell/Applications/Media/UploadManager/Result.aspx.js"/>
  
  <style type="text/css">
    body { 
      background:#e9e9e9; 
      overflow:hidden;
    }
    #Grid { 
      height:100% 
    }
    #FileListCell { 
      height:100%; vertical-align:top 
    }
    #FileList { 
      background:white; border:1px inset; height:100%; overflow:auto 
    }
    #FileList a, #FileList a:link, #FileList a:visited, #FileList a:hover, #FileList a:active{  
      cursor:default;
      display:inlne;
      padding: 5px;
      text-decoration:none;
      width:196px;
      vertical-align:top;
    }
    #FileList a:hover, #FileList a:active{  
      background:#c4dcff;
      border:1px solid #aecaef;
      padding: 4px;
    }
    #Buttons { 
      text-align:right; 
    }
    
    .scMediaIcon {
      width:48px;
      height:48px;
      float:left;
      margin:0px 4px 0px 0px;
      vertical-align:middle;
      border:1px solid #999999;
    }
    
    .scMediaTitle {
      font-weight:bold;
    }
    
    .scMediaDetails {
      padding:4px 0px 0px 0px;
      color:#666666;
    }
    
    .scMediaValidation {
      padding:2px 0px 0px 0px;
      color:red;
    }
    
  </style>
  
</head>
<body>
  <form id="Form" runat="server">
    <table id="Grid" width="100%" border="0" cellpadding="4" cellspacing="0">
    <tr>
      <td valign="top">
        <sc:Literal runat="server" Text="Uploaded Media Items:"/>
      </td>
    </tr>      
    <tr>
      <td id="FileListCell">
        <div id="FileList" runat="server">
        </div>
      </td>
    </tr>      
    
    <tr>
      <td id="Buttons">
        <button onclick="javascript:return Sitecore.App.invoke('CloseWindow')" style="font:8pt tahoma;height:24px;width:75px"><sc:Literal runat="server" Text="Close"/></button>
      </td>
    </tr>
    </table>
  
  </form>
</body>
</html>
