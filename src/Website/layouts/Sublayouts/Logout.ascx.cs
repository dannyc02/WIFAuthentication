using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.IdentityModel.Web;

namespace Website.layouts.Sublayouts
{
    public partial class Logout : System.Web.UI.UserControl
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            LogoutButton.Click += new EventHandler(LogoutButton_Click);
        }

        void LogoutButton_Click(object sender, EventArgs e)
        {
            WSFederationAuthenticationModule.FederatedSignOut(null, new Uri("http://poc.local"));
        }
    }
}