namespace FedAuthenticator.Authentication
{
    using System;

    using Microsoft.IdentityModel.Tokens;

    using Sitecore.Diagnostics;

    /// <summary>
    /// Custom WSSessionAuthenticationModule
    /// </summary>
    public class WSSessionAuthenticationModule : Microsoft.IdentityModel.Web.SessionAuthenticationModule
    {

        protected override void InitializeModule(System.Web.HttpApplication context)
        {
            context.AuthenticateRequest += new EventHandler(this.OnAuthenticateRequest);
            this.InitializePropertiesFromConfiguration(base.ServiceConfiguration.Name);
        }


        /// <summary>
        /// OnAuthenticateRequest event handler
        /// </summary>
        /// <param name="sender">
        /// The sender.
        /// </param>
        /// <param name="eventArgs">
        /// The event args.
        /// </param>
        protected override void OnAuthenticateRequest(object sender, EventArgs eventArgs)
        {
            // Skip event if Sitecore user already authenticated.
            if (Sitecore.Context.User != null && Sitecore.Context.User.IsAuthenticated)
            {
                return;
            }
            base.OnAuthenticateRequest(sender, eventArgs);
        }


    }
}