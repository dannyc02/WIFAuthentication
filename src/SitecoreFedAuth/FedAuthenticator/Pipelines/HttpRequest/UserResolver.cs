namespace FedAuthenticator.Pipelines.HttpRequest
{
    using System;
    using System.Linq;
    using System.Web;

    using Microsoft.IdentityModel.Tokens;
    using Microsoft.IdentityModel.Web;

    using Sitecore.Diagnostics;
    using Sitecore.Security.Authentication;

    /// <summary>
    /// WindowsIdentityUserResolver class
    /// </summary>
    public class UserResolver : Sitecore.Pipelines.HttpRequest.UserResolver
    {
        /// <summary>
        /// StartUrl constant
        /// </summary>
        private const string StartUrl = "/sitecore/shell/default.aspx";

        /// <summary>
        /// Pipeline processor main entry method.
        /// </summary>
        /// <param name="args">
        /// The args.
        /// </param>
        public override void Process(Sitecore.Pipelines.HttpRequest.HttpRequestArgs args)
        {
            var scUser = AuthenticationManager.GetActiveUser();
            if (Sitecore.Context.User != null && !Sitecore.Context.User.IsAuthenticated  && Sitecore.Context.User.Identity.GetType() != typeof(Sitecore.Security.UserProfile))
            {
                try
                {
                    SessionSecurityToken sessionToken = null;
                    FederatedAuthentication.SessionAuthenticationModule.TryReadSessionTokenFromCookie(out sessionToken);

                    if (sessionToken != null)
                    {
                        try
                        {
                            FederatedAuthentication.SessionAuthenticationModule.AuthenticateSessionSecurityToken(sessionToken, true);
                        }
                        catch
                        {
                            FederatedAuthentication.WSFederationAuthenticationModule.SignOut(false);
                            LoginHelper.RequestToken();
                        }
                    }

                }
                catch (Exception e)
                {
                    Log.Error("ADFS::Error parsing token", e, this);
                    return;
                }

                var user = HttpContext.Current.User;
                if (user != null)
                {
                    // We should be able to login here
                    // HttpContext.Current.Items.Add("WIF_Principal", user);
                    var loginHelper = new LoginHelper();
                    loginHelper.Login(user);
                }
            }
        }
    }
}