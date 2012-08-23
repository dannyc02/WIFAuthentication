namespace FedAuthenticator.Pipelines.HttpRequest
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Security.Principal;
    using System.Web;

    using Microsoft.IdentityModel.Claims;

    using Sitecore.Diagnostics;
    using Sitecore.Security.Authentication;
    using Sitecore.SecurityModel.Cryptography;
    using Sitecore.Web;
    using Microsoft.IdentityModel.Web;

    /// <summary>
    /// LoginHelper class.
    /// </summary>
    public class LoginHelper
    {


        /// <summary>
        /// Authenticates user via ADFS and logs them in to sitecore 
        /// </summary>
        /// <param name="user">
        /// The user.
        /// </param>
        public void Login(IPrincipal user)
        {
            var ssoId = user.Identity;

#if DEBUG
            this.WriteClaimsInfo((ClaimsIdentity)user.Identity);
#endif
            if (ssoId.IsAuthenticated)
            {
                string userId = string.Format("{0}\\{1}", Sitecore.Context.Domain.Name, ssoId.Name);

                try
                {
                    Sitecore.Security.Accounts.User scUser = AuthenticationManager.BuildVirtualUser(userId, true);

                    // add roles to user
                    var roles = Sitecore.Context.Domain.GetRoles();
                    bool roleAdded = false;
                    if (roles != null)
                    {
                        // iterate throughout Sitecore roles and assign it to
                        // the virtual user if this user is member of this role
                        // in the Active Directory
                        var identityRoles = this.GetGroups((IClaimsIdentity)user.Identity);
                        foreach (var role in roles)
                        {

                            string roleName = this.GetRoleName(role.Name);
                            if (identityRoles.Contains(roleName.ToLower()))
                            {
                                if (!scUser.Roles.Contains(role))
                                {
                                    scUser.Roles.Add(role);
                                    roleAdded = true;
                                }
                            }
                        }

                        // add inherited roles cuz it seems I need to.
                        foreach (var role in scUser.Roles)
                        {
                            foreach (var inheritedRole in Sitecore.Security.Accounts.RolesInRolesManager.GetRolesForRole(role, true))
                            {
                                if (!scUser.Roles.Contains(inheritedRole))
                                {
                                    scUser.Roles.Add(inheritedRole);
                                    roleAdded = true;
                                }
                            }
                        }


                    }

                    // login
                    bool result = AuthenticationManager.Login(scUser);
                    if (roleAdded)
                    {
                        Sitecore.Caching.CacheManager.ClearSecurityCache(scUser.Name);
                        Sitecore.Caching.CacheManager.ClearIsInRoleCache(scUser.Name);
                        Sitecore.Caching.CacheManager.GetAccessResultCache().RemoveKeysContaining(scUser.Name);

                    }
                }
                catch (ArgumentException ex)
                {
                    Log.Error("ADFS::Login Failed!", ex, this);
                }
            }
        }

        /// <summary>
        /// Retrieves ADFS identity membership.
        /// </summary>
        /// <param name="claimsIdentity">
        /// The claims identity.
        /// </param>
        /// <returns>
        /// ADFS identity groups.
        /// </returns>
        private string[] GetGroups(IClaimsIdentity claimsIdentity)
        {
            var claims = (from c in claimsIdentity.Claims where c.ClaimType == ClaimTypes.Role select c);
            
            List<string> claimsList = new List<string>();
            foreach (var claim in claims)
            {
                var value = claim.Value.ToLower().Replace('-','_');
                if (!claimsList.Contains(value))
                    claimsList.Add(value);
            }

            return claimsList.ToArray();
        }

        /// <summary>
        /// Gets role name without domain name.
        /// </summary>
        /// <param name="roleName">
        /// The role name.
        /// </param>
        /// <returns>
        /// Role name.
        /// </returns>
        private string GetRoleName(string roleName)
        {
            if (roleName.Contains('\\'))
            {
                return roleName.Split('\\')[1];
            }

            return roleName;
        }

        public static void RequestToken()
        {
            //send to federation server 
            var wsFedAuthMod = FederatedAuthentication.WSFederationAuthenticationModule;
            var signMsg = wsFedAuthMod.CreateSignInRequest(Guid.NewGuid().ToString(), HttpContext.Current.Request.RawUrl, false);
            string redirUrl = signMsg.WriteQueryString();
            Sitecore.Web.WebUtil.Redirect(redirUrl);
        }

#if DEBUG
        /// <summary>
        /// Writs claims information to log file.
        /// </summary>
        /// <param name="claimsIdentity">
        /// The claims identity.
        /// </param>
        private void WriteClaimsInfo(IClaimsIdentity claimsIdentity)
        {
            Log.Info("Writing Claims Info", this);
            foreach (var claim in claimsIdentity.Claims)
            {
                Log.Info(string.Format("Claim : {0} , {1}", claim.ClaimType, claim.Value), this);
            }
        }

        public void AddClaimsInfo(Sitecore.Security.Accounts.User user, IClaimsIdentity claimsIdentity)
        {
            //Modify user based on claims info here
            return;
        }
#endif
    }
}