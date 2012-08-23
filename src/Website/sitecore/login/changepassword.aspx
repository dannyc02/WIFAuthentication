<%@ Page language="c#" AutoEventWireup="True" Inherits="Sitecore.Login.ChangePasswordPage" CodeBehind="ChangePassword.aspx.cs" %>
<%@ OutputCache Location="None" VaryByParam="none" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<html>
<head>
  <title>Sitecore</title>
  <link href="/sitecore/login/default.css" rel="stylesheet" />
  <style>
    #ChangePassword{
      width:340px;
      margin:auto;
    }
  </style>
</head>
<body>
 <form id="LoginForm" runat="server">
   <div id="Body">
      <div id="Banner">
        <div id="BannerPartnerLogo">
          <asp:PlaceHolder ID="PartnerLogo" runat="server" />
        </div>
        
        <img id="BannerLogo" src="/sitecore/login/logo.png" alt="Sitecore Logo" border="0" />
      </div>
      
      <div id="Menu">
        &nbsp;
      </div>

      <div id="FullPanel">
        <div id="FullTopPanel" style="padding:0px 0px 32px 0px">
        
          <div class="FullTitle">Change Your Password.</div>
          <asp:Literal ID="ChangePasswordDisabledLabel" runat="server" Visible="False" Text="Change Password  functionality is disabled. Please contact your system administrator." />
          <div class="Centered">
            <asp:ChangePassword ID="ChangePassword" runat="server" CancelDestinationPageUrl="default.aspx" DisplayUserName="True" InstructionText="Enter your username and old password." Font-Names="verdana" Font-Size="9pt" ContinueDestinationPageUrl="default.aspx">
              <CancelButtonStyle BackColor="#FFFBFF" BorderColor="#CCCCCC" BorderStyle="Solid" BorderWidth="1px" Font-Names="tahoma" ForeColor="#284775" />
              <ChangePasswordButtonStyle BackColor="#FFFBFF" BorderColor="#CCCCCC" BorderStyle="Solid" BorderWidth="1px" Font-Names="Verdana" ForeColor="#284775" />
              <ContinueButtonStyle BackColor="#FFFBFF" BorderColor="#CCCCCC" BorderStyle="Solid" BorderWidth="1px" Font-Names="Verdana" ForeColor="#284775" />
              <TitleTextStyle Font-Bold="True" ForeColor="White" />
              <PasswordHintStyle Font-Italic="True" ForeColor="#888888" />
              <InstructionTextStyle ForeColor="Black" Font-Size="9pt" Font-Names="verdana" />
              <LabelStyle Font-Size="9pt" Font-Names="verdana" />
              <TextBoxStyle Font-Bold="true" Font-Size="9pt" Font-Names="verdana" />
            </asp:ChangePassword>
          </div>
        </div>
      </div>
      
    </div>
  </form>
</body>
</html>

