using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.IdentityModel.Claims;
using Microsoft.IdentityModel.Tokens;
using Microsoft.IdentityModel.Web;
using Sitecore;
using Sitecore.Configuration;
using Sitecore.Diagnostics;
using Sitecore.Links;
using Sitecore.Pipelines.HttpRequest;
using Sitecore.Security.Accounts;
using Sitecore.Sites;
using Microsoft.IdentityModel.Configuration;
using Microsoft.IdentityModel.Web.Configuration;
using System.Collections.Specialized;
using Microsoft.IdentityModel.Protocols.WSFederation;
using FedAuthenticator.Pipelines.HttpRequest;

namespace FedAuthenticator.Pipelines.HttpRequest
{


    public class TokenRequestor : HttpRequestProcessor
    {

        public override void Process(HttpRequestArgs args)
        {
            if (Sitecore.Context.User != null && Sitecore.Context.User.IsAuthenticated) { return; }
            Assert.ArgumentNotNull(args, "args");
            SiteContext site = Context.Site;
            User user = Sitecore.Context.User;
            System.Web.HttpRequest Request = HttpContext.Current.Request;

            SessionSecurityToken sessionToken = null;
            //var sessionModule = new FedAuthenticator.WSSessionAuthenticationModule();
            FederatedAuthentication.SessionAuthenticationModule.TryReadSessionTokenFromCookie(out sessionToken);
            if (sessionToken != null)
            {
                FederatedAuthentication.SessionAuthenticationModule.AuthenticateSessionSecurityToken(sessionToken, false);
            }

            if (args.PermissionDenied || (sessionToken != null && !string.IsNullOrEmpty(sessionToken.Id)))
            {
                LoginHelper.RequestToken();
            }
        }
    }
}