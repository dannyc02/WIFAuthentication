<%@ Page language="c#" AutoEventWireup="True" Inherits="Sitecore.Login.PasswordRecoveryPage" CodeBehind="passwordrecovery.aspx.cs" %>
<%@ OutputCache Location="None" VaryByParam="none" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<html>
<head>
  <title>Sitecore</title>
  <link href="/sitecore/login/default.css" rel="stylesheet" />
  <style>
    #PasswordRecovery{
      width:320px;
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
        <div id="FullTopPanel">
          <div class="FullTitle">Forgot Your Password?</div>
          <asp:Literal ID="ForgotPasswordDisabledLabel" runat="server" Visible="False" Text="Forgot Your Password functionality is disabled. Please contact your system administrator." />
          
          <div class="Centered" style="padding:16px 0px 32px 0px">
            <asp:PasswordRecovery ID="PasswordRecovery" runat="server"  
              SuccessPageUrl="default.aspx"
              OnVerifyingUser="VerifyingUser"
              OnSendingMail="SendEmail" 
              Font-Names="Verdana">
              <MailDefinition Priority="High" Subject="Sending Per Your Request" From="someone@example.com" />
              <InstructionTextStyle ForeColor="Black" Font-Size="9pt" Font-Names="verdana" />
              <SuccessTextStyle Font-Bold="True" ForeColor="#1C5E55" />
              <TitleTextStyle Font-Bold="True" ForeColor="White" />
              <LabelStyle Font-Size="9pt" Font-Names="verdana" />
              <TextBoxStyle Font-Bold="true" Font-Size="9pt" Font-Names="verdana" />
              <SubmitButtonStyle BackColor="#FFFBFF" BorderColor="#CCCCCC" BorderStyle="Solid" BorderWidth="1px" Font-Names="tahoma" ForeColor="#284775" />
            </asp:PasswordRecovery>
          </div>
        </div>
      </div>
    </div>
  </form>
</body>
</html>

