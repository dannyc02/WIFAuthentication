namespace FedAuthenticator.Authentication
{
    using System.Web;
    using System.Web.Security;

    using Microsoft.IdentityModel.Tokens;
    using Microsoft.IdentityModel.Web;

    using Sitecore.Configuration;
    using Sitecore.Diagnostics;
    using Sitecore.Security.Accounts;
    using Sitecore.SecurityModel;

    /// <summary>
    /// AdfsAuthenticationProvider class
    /// </summary>
    public class FederatedAuthenticationProvider : Sitecore.Security.Authentication.MembershipAuthenticationProvider
    {
        /// <summary>
        /// Authentication helper
        /// </summary>
        private AuthenticationHelper helper;

        /// <summary>
        /// Gets an instance of AuthenticationHelper.
        /// </summary>
        protected override Sitecore.Security.Authentication.AuthenticationHelper Helper
        {
            get
            {
                AuthenticationHelper hlpr = this.helper;
                Assert.IsNotNull(hlpr, "AuthenticationHelper has not been set. It must be set in Initialize.");
                return hlpr;

            }
        }

        /// <summary>
        /// GetActiveUser method
        /// </summary>
        /// <returns>
        /// Returns an active user.
        /// </returns>
        public override Sitecore.Security.Accounts.User GetActiveUser()
        {
            User activeUser = this.Helper.GetActiveUser();
            Assert.IsNotNull(activeUser, "Active user cannot be empty.");
            return activeUser;
        }

        /// <summary>
        /// Initializing authentication provider.
        /// </summary>
        /// <param name="name">
        /// The name.
        /// </param>
        /// <param name="config">
        /// The config.
        /// </param>
        public override void Initialize(string name, System.Collections.Specialized.NameValueCollection config)
        {
            Assert.ArgumentNotNullOrEmpty(name, "name");
            Assert.ArgumentNotNull(config, "config");
            base.Initialize(name, config);
            this.helper = new AuthenticationHelper(this);
        }

        /// <summary>
        /// Logs the specified user into the system. 
        /// </summary>
        /// <param name="userName">
        /// The user name.
        /// </param>
        /// <param name="persistent">
        /// The persistent.
        /// </param>
        /// <returns>
        /// Returns True if the user is logged in successfully.
        /// </returns>
        public override bool Login(string userName, bool persistent)
        {
            Assert.ArgumentNotNullOrEmpty(userName, "userName");
            if (!base.Login(userName, persistent))
            {
                return false;
            }

            SessionSecurityToken sessionToken;
            
            //Allow Forms authentication.
            if (!FederatedAuthentication.SessionAuthenticationModule.TryReadSessionTokenFromCookie(out sessionToken))
            {
                FormsAuthentication.SetAuthCookie(userName, persistent);
            }

            return true;
        }

        /// <summary>
        /// Logs the specified user into the system
        /// </summary>
        /// <param name="user">
        /// The user.
        /// </param>
        /// <returns>
        /// Returns True if login is successful, False otherwise.
        /// </returns>
        public override bool Login(Sitecore.Security.Accounts.User user)
        {
            Assert.ArgumentNotNull(user, "user");
            if (!base.Login(user))
            {
                return false;
            }


            SessionSecurityToken sessionToken;

            
            //// Allow Forms authentication.
            if (!FederatedAuthentication.SessionAuthenticationModule.TryReadSessionTokenFromCookie(out sessionToken))
            {
                FormsAuthentication.SetAuthCookie(user.Name, false);
            }
            this.StoreMetaData(user);
            return true;
        }

        /// <summary>
        /// Logs out the current user.
        /// </summary>
        public override void Logout()
        {
            base.Logout();
            Sitecore.Shell.Applications.ContentEditor.RecentDocuments.Remove();

            SessionSecurityToken sessionToken;
            
            // Handle Forms authentication.
            if (!FederatedAuthentication.SessionAuthenticationModule.TryReadSessionTokenFromCookie(out sessionToken))
            {
                FormsAuthentication.SignOut();
                this.ClearFormCookies();
            }
            
            FederatedAuthentication.SessionAuthenticationModule.SignOut();
        }

        /// <summary>
        /// Sets the active user.
        /// </summary>
        /// <param name="user">
        /// The user.
        /// </param>
        public override void SetActiveUser(Sitecore.Security.Accounts.User user)
        {
            this.Helper.SetActiveUser(user);
        }

        /// <summary>
        /// Sets the active user.
        /// </summary>
        /// <param name="userName">
        /// The user name.
        /// </param>
        public override void SetActiveUser(string userName)
        {
            Assert.ArgumentNotNullOrEmpty(userName, "userName");
            this.Helper.SetActiveUser(userName);
        }

        /// <summary>
        /// Stores the users meta data (if it is a virtual user). 
        /// </summary>
        /// <param name="user">
        /// The user.
        /// </param>
        private void StoreMetaData(User user)
        {
            UserRuntimeSettings runtimeSettings = user.RuntimeSettings;
            if (runtimeSettings.IsVirtual)
            {
                ClientContext.SetValue("SC_USR_" + user.Name, runtimeSettings.Serialize());
            }
        }

        /// <summary>
        /// Clears the cookies.
        /// </summary>
        private void ClearFormCookies()
        {
            HttpContext current = HttpContext.Current;
            if (((current != null) && (current.Request != null)) && ((current.Request.Browser != null) && (current.Request.Cookies != null)))
            {
                string noCookie = string.Empty;
                if (current.Request.Browser["supportsEmptyStringInCookieValue"] == "false")
                {
                    noCookie = "NoCookie";
                }

                if ((current.Request.Cookies[FormsAuthentication.FormsCookieName] != null) && (string.Compare(current.Request.Cookies[FormsAuthentication.FormsCookieName].Value, noCookie, true) != 0))
                {
                    current.Request.Cookies[FormsAuthentication.FormsCookieName].Value = noCookie;
                }
            }
        }
        
    }
}