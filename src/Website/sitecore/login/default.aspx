<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="default.aspx.cs" Inherits="Sitecore.sitecore.login.LoginPage" %>

<%@ OutputCache Location="None" VaryByParam="none" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Sitecore</title>
    <link href="/sitecore/login/default.css" rel="stylesheet" />

    <script type="text/JavaScript" language="javascript" src="/sitecore/login/default.js"></script>

    <!--[if IE 6]>
    <style type="text/css">

        #Right
        {
            overflow: hidden;
            width: 236px;
        }

        #SystemInformation
        {
            margin-left: 4px;
            margin-right: 5px;
            margin-top: 6px;
        }

        #SDN
        {
            margin-left: -4px;
        }

    </style>
    <![endif]-->

    <asp:PlaceHolder id="ExpressStylesheet" runat="server" />
</head>
<body onload="javascript:onLoad()">
    <form id="LoginForm" runat="server">
    <input id="ActiveTab" runat="server" name="ActiveTab" type="hidden" />
    <input id="AdvancedOptionsStartUrl" runat="server" name="AdvancedOptionsStartUrl"
        type="hidden" />
    <div id="Body">
        <div id="Banner">
            <div id="BannerPartnerLogo">
                <asp:PlaceHolder ID="PartnerLogo" runat="server" />
            </div>
            <img id="BannerLogo" src="/sitecore/login/logo.png" alt="Sitecore Logo" border="0" />
        </div>
        <div id="Menu">
            <div style="border-right: 1px solid #d94c30; width: 560px; height: 31px">
                <div style="border-right: 1px solid #a11f03; width: 559px; height: 31px">
                    <div style="border-right: 1px solid #d94c30; width: 558px; height: 31px">
                    </div>
                </div>
            </div>
        </div>
        <div id="Right">
            <div id="SystemInformation">
                <div id="LicensePanel">
                    <asp:PlaceHolder ID="LicenseText" runat="server" />
                </div>
                <div id="VersionPanel" class="SystemInformationDivider">
                    <asp:PlaceHolder ID="VersionText" runat="server" />
                </div>
                <div id="DatabasePanel" runat="server" class="SystemInformationDivider">
                    <asp:PlaceHolder ID="DatabaseText" runat="server" />
                </div>
                <div id="CustomTextPanel" runat="server" class="SystemInformationDivider">
                    <asp:PlaceHolder ID="CustomText" runat="server" />
                </div>
            </div>
            <div id="SDN">
                <iframe id="StartPage" runat="server" allowtransparency="true" frameborder="0" scrolling="auto"
                    marginheight="0" marginwidth="0" style="display: none"></iframe>
            </div>
        </div>
        <div id="Left" align="center">
            <div id="LoginPanelOuter">
                <table id="LoginPanel" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td valign="top" height="1">
                            <div id="LoginTitle">
                                <asp:PlaceHolder ID="LoginTitleText" runat="server" />
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td valign="top" align="center" height="1">
                            <div id="LoginPanelBox">
                                <asp:Login ID="Login" runat="server" PasswordLabelText="Password:" UserNameLabelText="User name:"
                                    TitleText="" FailureAction="Refresh">
                                    <LayoutTemplate>
                                        <table cellpadding="2" cellspacing="0" border="0">
                                            <tr>
                                                <td id="UserNameLabel" align="right">
                                                    User name:
                                                </td>
                                                <td align="left">
                                                    <asp:TextBox ID="UserName" runat="server"></asp:TextBox>
                                                    <asp:RequiredFieldValidator ID="UserNameRequired" runat="server" ControlToValidate="UserName"
                                                        Text="*"></asp:RequiredFieldValidator>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td id="PasswordLabel" align="right">
                                                    Password:
                                                </td>
                                                <td align="left">
                                                    <asp:TextBox ID="Password" runat="server" TextMode="Password"></asp:TextBox>
                                                    <asp:RequiredFieldValidator ID="PasswordRequired" runat="server" ControlToValidate="Password"
                                                        Text="*"></asp:RequiredFieldValidator>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                </td>
                                                <td align="left" style="padding-bottom: 12px;">
                                                    <asp:CheckBox Style="margin-left: -4px" ID="Remember" Text="Remember me" runat="server" />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" align="center">
                                                    <asp:Button ID="Login" CommandName="Login" runat="server" Text="Login"></asp:Button>
                                                </td>
                                            </tr>
                                        </table>
                                        <div id="LoginText">
                                            <asp:Literal ID="FailureText" runat="server" />
                                        </div>
                                    </LayoutTemplate>
                                    <LabelStyle Font-Size="8pt" Font-Names="tahoma" />
                                    <LoginButtonStyle Width="75px" Height="25px" Font-Names="tahoma" Font-Size="8pt"
                                        Font-Bold="true" />
                                    <TextBoxStyle Font-Bold="true" Font-Size="8pt" Font-Names="tahoma" />
                                </asp:Login>
                                <div id="LoginText">
                                    <asp:Literal ID="FailureText2" runat="server" />
                                </div>
                                <div id="LoginOptions">
                                    <a class="LoginOption" id="ForgotYourPassword" runat="server" href="/sitecore/login/passwordrecovery.aspx">Forgot Your Password</a>
                                    <a class="LoginOption" id="ChangePassword" runat="server" href="/sitecore/login/changepassword.aspx">Change Password</a>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td height="300" valign="top">
                            <div id="BasicMoreOptions">
                                <div>
                                    <a href="#" hidefocus="true" onclick="javascript:return scToggleOptions()">Options</a>
                                </div>
                                <div id="OptionBox" class="OptionBox" style="display: none" runat="server">
                                    <div id="AdvancedOptions" class="OptionBoxOptions">
                                        <div align="left" class="OptionLabel">
                                            User Interface:</div>
                                        <div class="UIPanel">
                                            <button id="AdvancedDesktop" type="button" runat="server" onclick="javascript:onClick('AdvancedDesktop', '/sitecore/shell/default.aspx')"
                                                ondblclick="javascript:onDblClick()">
                                                <img class="AdvancedOptionImage" src="/sitecore/shell/~/icon/People/24x24/monitor.png.aspx"
                                                    alt="Desktop" border="0" />
                                                Desktop
                                            </button>
                                            <button id="AdvancedContentEditor" type="button" runat="server" onclick="javascript:onClick('AdvancedContentEditor', '/sitecore/shell/applications/clientusesoswindows.aspx')"
                                                ondblclick="javascript:onDblClick()">
                                                <img class="AdvancedOptionImage" src="/sitecore/shell/~/icon/People/24x24/cube_blue.png.aspx"
                                                    alt="Content Editor" border="0" />
                                                Content Editor
                                            </button>
                                            <button id="AdvancedWebEdit" type="button" runat="server" onclick="javascript:onClick('AdvancedWebEdit', '/sitecore/shell/applications/webedit.aspx')"
                                                ondblclick="javascript:onDblClick()">
                                                <img class="AdvancedOptionImage" src="/sitecore/shell/~/icon/Applications/24x24/document_edit.png.aspx"
                                                    alt="WebEdit" border="0" />
                                                Page Editor
                                            </button>
                                        </div>
                                    </div>
                                    <div id="LanguagePanel">
                                        <div align="left" class="OptionLabel">
                                            User Interface Language:</div>
                                        <div style="padding: 4px 0px 8px 0px" align="left">
                                            <select id="Language" runat="server" name="Language" style="border: 1px solid #ededed;
                                                width: 100%" />
                                        </div>
                                    </div>
                                    <div style="padding: 4px 0px 0px 0px">
                                        <button style="font: 8pt tahoma; height: 25px; background: transparent; border: 1px solid #e0e0e0;
                                            color: #666666" onclick="javascript:return scToggleOptions()">
                                            Close Options</button>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td valign="bottom" height="1">
                            <div id="SitecoreLink">
                                <a href="http://www.sitecore.net" target="_blank">Visit www.sitecore.net</a>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
    </form>
</body>
</html>