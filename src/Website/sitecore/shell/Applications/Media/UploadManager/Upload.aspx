<%@ Page AutoEventWireup="true" Inherits="Sitecore.Shell.Applications.Media.UploadManager.UploadPage" Language="C#" %>
<%@ Import Namespace="Sitecore.Globalization" %>
<%@ Register Assembly="Sitecore.Kernel" Namespace="Sitecore.Web.UI.HtmlControls" TagPrefix="sc" %>
<%@ Register Assembly="Sitecore.Kernel" Namespace="Sitecore.Web.UI.WebControls" TagPrefix="sc" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<html >
<head runat="server">
  <title>Sitecore</title>
  <sc:Head runat="server" />
  <sc:Script runat="server" Src="/sitecore/shell/Controls/Sitecore.Runtime.js"/>
  <sc:Script runat="server" Src="/sitecore/shell/Applications/Media/UploadManager/Upload.aspx.js"/>
  
  <style type="text/css">
    input { font:9pt verdana }
    body { background:#e9e9e9; height:100%;}
    form { height:100%; }
    #Grid { height:100% }
    #FileListCell { height:100%; vertical-align:top }
    #FileList { background:white; border:1px inset; height:100%; padding:4px; overflow:auto }
    #FileList input {  width:100%; }
    #Buttons { text-align:right; vertical-align:bottom }
  </style>
  
</head>
<body>
  <form id="UploadForm" runat="server" enctype="multipart/form-data" target="SitecoreUpload">
    <input id="Uri" runat="server" name="Item" type="hidden" value="" />
    <input id="Folder" runat="server" name="Path" type="hidden" value="" />
    <input id="Uploading" runat="server" type="hidden" value="1" />
    <input id="UploadedItems" runat="server" type="hidden" value="" />
    <input id="UploadedItemsHandle" runat="server" type="hidden" value="" />
    <input id="ErrorText" runat="server" type="hidden" value="" />
    
    <table id="Grid" runat="server" border="0" cellpadding="4" cellspacing="0" width="100%">
    <tr>
      <td style="padding:0px">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:white">
          <tr>
            <td valign="top">
              <sc:ThemedImage runat="server" height="32" margin="4px 8px 4px 8px" src="Applications/32x32/folder_up.png" width="32"/>
            </td>
            <td valign="top" width="100%">
              <div style="padding:2px 16px 0px 0px">
                <div style="color:black;padding:0px 0px 4px 0px;font:bold 9pt tahoma">
                  <sc:Literal runat="server" Text="Batch Upload"/>
                </div>
                <div style="color:#333333">
                  <sc:Literal runat="server" Text="Uploads a number of files to the server."/>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0px">
        <div style="background: #dbdbdb"><sc:Space runat="server" /></div>
      </td>
    </tr>
      <tr>
        <td valign="top">
          <sc:Literal runat="server" Text="Select the Files to Upload Here:"/>
        </td>
      </tr>
      <tr>
      <td id="FileListCell">
        <div id="FileList">
          <input id="File0" name="File0" type="file" value="browse" onchange="javascript:return Sitecore.Upload.change(this)"/>
        </div>
      </td>
    </tr>      
    
    <tr>
      <td>
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td>
              <input id="Unpack" name="Unpack" type="checkbox" value="1" /><label for="Unpack"><sc:Literal runat="server" Text="Unpack ZIP Archives"></sc:Literal></label>
            </td>
            <td>
              <input runat="server" id="Versioned" name="Versioned" type="checkbox" value="1" /><label for="Versioned"><sc:Literal runat="server" Text="Make Uploaded Media Items Versionable"></sc:Literal></label>
            </td>
          </tr>
          <tr>
            <td runat="server" id="OverwriteCell">
              <input runat="server" id="Overwrite" name="Overwrite" type="checkbox" value="1" /><label for="Overwrite"><sc:Literal runat="server" Text="Overwrite Existing Media Items"></sc:Literal></label>
            </td>
            <td runat="server" id="AsFilesCell">
              <input runat="server" id="AsFiles" name="AsFiles" type="checkbox" value="1" /><label for="AsFiles"><sc:Literal runat="server" Text="Upload as Files"></sc:Literal></label>
            </td>
          </tr>
          <tr>
            <td colspan="2" id="Buttons">
              <input id="Upload" style="font:8pt tahoma;height:24px;width:75px" type="Submit" value='<%= Translate.Text("Upload")  %>' />
            </td>
          </tr>
        </table>
      </td>
    </tr>
    </table>
  
  </form>
</body>
</html>
