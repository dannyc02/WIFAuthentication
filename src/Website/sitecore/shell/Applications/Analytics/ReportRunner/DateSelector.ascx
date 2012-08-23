<%@ Control Language="C#" AutoEventWireup="false" CodeBehind="DateSelector.ascx.cs" Inherits="Sitecore.Shell.Applications.Analytics.ReportRunner.DateSelector" %>
<%@ register tagprefix="t" namespace="Telerik.Web.UI" assembly="Telerik.Web.UI" %>
<%@ register tagprefix="sc" namespace="Sitecore.Web.UI.HtmlControls" assembly="Sitecore.Kernel" %>

<div style="border: 1px solid #e9e9e9; margin: 8px 8px 0px 8px; font: 10pt tahoma; float: left; cursor: hand" onclick="javascript:$('Criteria').toggle()">
  <div style="float: left; padding: 4px">
    <sc:literal id="Dates" runat="server" />
  </div>
  <div style="float: left; background: #f9f9f9; border-left: 1px solid #e9e9e9">
    <sc:themedimage src="Images/ContentSectionButton1.png" width="16" height="16" margin="5px 0px 0px 0px" runat="server" />
  </div>
</div>
<div id="Criteria" style="border: 1px solid #e9e9e9; position: relative; background: #f9f9f9; padding: 4px; clear: left; float: left; margin: -1px 0px 0px 8px; font: 8pt tahoma; display: none">
  <div>
    <sc:literal runat="server" text="Date Range" />
  </div>
  <div style="padding: 2px 0px 0px 0px">
    <t:raddatepicker id="StartDatePicker" enablemultiselect="false" usecolumnheadersasselectors="false" height="22" runat="server" style="font: 8pt tahoma" />
    &#160;-&#160;
    <t:raddatepicker id="EndDatePicker" enablemultiselect="false" usecolumnheadersasselectors="false" height="22" runat="server" style="font: 8pt tahoma" />
  </div>
  <div style="padding: 4px 0px 0px 0px">
    <button type="submit" style="font: 8pt tahoma; padding: 2px 8px 2px 8px">
      <sc:literal text="Apply" runat="server" />
    </button>
  </div>
</div>
