using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sitecore.Diagnostics;
using Sitecore.Web;
using Sitecore.SecurityModel.Cryptography;

namespace FedAuthenticator.sitecore_modules.shell.FedAuthenticator
{
    public partial class sso : System.Web.UI.Page
    {
        /// <summary>
        /// StartUrl constant.
        /// </summary>
        protected const string StartUrl = "/sitecore/shell/default.aspx";

        protected void Page_Load(object sender, EventArgs e)
        {
                WriteCookie("sitecore_starturl", StartUrl);
                WriteCookie("sitecore_starttab", "advanced");

                HttpContext.Current.Response.Redirect(StartUrl);
        }

        public static bool CanRunApplication(string applicationName)
        {
            Assert.IsNotNullOrEmpty(applicationName, "applicationName");
            if (!applicationName.StartsWith("/"))
            {
                applicationName = "/sitecore/content/Applications/" + applicationName;
            }
            Sitecore.Data.Items.Item item = null;
            using (new Sitecore.SecurityModel.SecurityDisabler())
            {
                item = Sitecore.Client.CoreDatabase.GetItem(applicationName);
            }
            return item.Access.CanRead();
        }



        /// <summary>
        /// Writes a cookie to the browser
        /// </summary>
        /// <param name="name">cookie name</param>
        /// <param name="value">cookie value</param>
        private static void WriteCookie(string name, string value)
        {
            Assert.ArgumentNotNull(name, "name");
            Assert.ArgumentNotNull(value, "value");
            if (name == WebUtil.GetLoginCookieName())
            {
                value = MachineKeyEncryption.Encode(value);
            }
            HttpCookie cookie3 = new HttpCookie(name, value)
            {
                Expires = DateTime.Now.AddMonths(3),
                Path = "/sitecore/login"
            };
            HttpCookie cookie = cookie3;
            HttpContext.Current.Response.AppendCookie(cookie);
            HttpCookie cookie2 = HttpContext.Current.Request.Cookies[name];
            if (cookie2 != null)
            {
                cookie2.Value = value;
            }
        }
    }
}