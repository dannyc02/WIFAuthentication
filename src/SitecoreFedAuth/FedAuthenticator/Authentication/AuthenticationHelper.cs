namespace FedAuthenticator.Authentication
{
    using System.Security.Principal;
    using System.Threading;
    using System.Web;

    using Microsoft.IdentityModel.Claims;
    using Microsoft.IdentityModel.Tokens;
    using Microsoft.IdentityModel.Web;

    using Sitecore.Diagnostics;
    using Sitecore.Security.Accounts;
    using Sitecore.Security.Authentication;

    /// <summary>
    /// AuthenticationHelper class
    /// </summary>
    public class AuthenticationHelper : Sitecore.Security.Authentication.AuthenticationHelper
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AuthenticationHelper"/> class.
        /// </summary>
        /// <param name="provider">
        /// The provider.
        /// </param>
        public AuthenticationHelper(AuthenticationProvider provider)
            : base(provider)
        {
        }

        /// <summary>
        /// Sets the active user.
        /// </summary>
        /// <param name="user">
        /// The user.
        /// </param>
        public override void SetActiveUser(Sitecore.Security.Accounts.User user)
        {
            Assert.ArgumentNotNull(user, "user");
            string fullUserName = user.Name;
            if (!fullUserName.Contains("\\"))
            {
                fullUserName = this.Globalize(Sitecore.Context.Domain.Name, fullUserName);
            }

            base.SetActiveUser(user);
            
        }

        /// <summary>
        /// Sets the active user.
        /// </summary>
        /// <param name="userName">
        /// The user name.
        /// </param>
        public override void SetActiveUser(string userName)
        {
            Assert.ArgumentNotNull(userName, "userName");

            string fullUserName = userName;
            if (!fullUserName.Contains("\\"))
            {
                fullUserName = this.Globalize(Sitecore.Context.Domain.Name, fullUserName);
            }

            base.SetActiveUser(userName);
        }

        /// <summary>
        /// Gets active user.
        /// </summary>
        /// <returns>
        /// The active user.
        /// </returns>
        //public override Sitecore.Security.Accounts.User GetActiveUser()
        //{
        //    User user = this.GetCurrentUser();

        //    if ((user != null) && !(user.Identity is IClaimsIdentity))
        //    {
        //        this.EnsureActiveUser(user);
        //        return user;
        //    }

        //    return base.GetActiveUser();
        //}

        /// <summary>
        /// Determines whether the specified user is disabled. 
        /// </summary>
        /// <param name="user">
        /// The user.
        /// </param>
        /// <returns>
        /// true if the specified user is disabled; otherwise, false.
        /// </returns>
        protected virtual bool IsDisabled(User user)
        {
            Assert.ArgumentNotNull(user, "user");
            return !user.Profile.IsAnonymous && user.Profile.State.Contains("Disabled");
        }

        /// <summary>
        /// GetCurrentUser method
        /// </summary>
        /// <returns>
        /// Returns User object
        /// </returns>
        protected new virtual User GetCurrentUser()
        {
            HttpContext current = HttpContext.Current;
            if (current != null)
            {
                IPrincipal user = current.User;

                if (user == null)
                {
                    SessionSecurityToken sessionToken;
                    FederatedAuthentication.SessionAuthenticationModule.TryReadSessionTokenFromCookie(out sessionToken);
                    if (sessionToken != null)
                    {
                        if (sessionToken.ClaimsPrincipal != null)
                        {
                            IIdentity idnt = sessionToken.ClaimsPrincipal.Identity;
                            if (!string.IsNullOrEmpty(idnt.Name))
                            {
                                if (User.Exists(Globalize(Sitecore.Context.Domain.Name, idnt.Name)))
                                {
                                    var usr = GetUser(Globalize(Sitecore.Context.Domain.Name, idnt.Name), true);
                                    return usr;
                                }
                            }
                        }
                    }
                    return base.GetCurrentUser();
                }

                return null;
            }

            if (Thread.CurrentPrincipal != null)
            {
                if (Thread.CurrentPrincipal is User)
                {
                    return (Thread.CurrentPrincipal as User);
                }

                if (!string.IsNullOrEmpty(Thread.CurrentPrincipal.Identity.Name))
                {
                    return GetUser(
                        Thread.CurrentPrincipal.Identity.Name, Thread.CurrentPrincipal.Identity.IsAuthenticated);
                }
            }

            return null;
        }

        /// <summary>
        /// Gets Sitecore user instance.
        /// </summary>
        /// <param name="userName">
        /// The user name.
        /// </param>
        /// <param name="isAuthenticated">
        /// The is authenticated.
        /// </param>
        /// <returns>
        /// Sitecore user.
        /// </returns>
        private static User GetUser(string userName, bool isAuthenticated)
        {
            Assert.ArgumentNotNull(userName, "userName");
            return User.FromName(userName, isAuthenticated);
        }

        /// <summary>
        /// If domina name is not a part of the user name, it adds it as a prefix.
        /// </summary>
        /// <param name="domainName">
        /// The domain name.
        /// </param>
        /// <param name="userName">
        /// The user name.
        /// </param>
        /// <returns>
        /// Full user name.
        /// </returns>
        private string Globalize(string domainName, string userName)
        {
            string loginName = userName;
            if ( !userName.StartsWith(domainName + "\\" ) ) 
                loginName =  domainName + "\\" + userName;

            return loginName;
        }

    }
}