# 🛡️ Security Configuration for Public Hosting

## ⚠️ **CRITICAL SECURITY STEPS**

### 1. **Change Default Credentials Immediately**
```bash
# Login to your admin panel
# Go to Settings > Change Password
# Use a strong password (12+ characters, mixed case, numbers, symbols)
```

### 2. **Configure Environment Variables**
Update your `.env` file with secure values:

```env
# Change these from defaults!
JWT_SECRET=your-super-secure-random-string-here-make-it-long-and-complex
DISCORD_BOT_TOKEN=your-actual-discord-bot-token
DISCORD_CHANNEL_ID=your-actual-discord-channel-id
ADMIN_ROLE_IDS=your-actual-admin-role-ids

# For production
NODE_ENV=production
```

### 3. **Enable Rate Limiting**
The application already has rate limiting, but you can adjust it in `backend/server.js`:

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Reduced from 100 for public access
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
```

### 4. **Firewall Configuration**

#### Windows Firewall:
```cmd
# Allow only necessary ports
netsh advfirewall firewall add rule name="Licensing Frontend" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="Licensing API" dir=in action=allow protocol=TCP localport=4000

# Block other ports
netsh advfirewall firewall add rule name="Block SSH" dir=in action=block protocol=TCP localport=22
```

#### Router Firewall:
- Enable SPI (Stateful Packet Inspection)
- Enable DoS protection
- Block all ports except 3000, 4000, 80, 443
- Enable logging for monitoring

### 5. **SSL/HTTPS Setup (Recommended)**

#### Using Let's Encrypt with ngrok:
```bash
# ngrok automatically provides HTTPS
# Your URLs will be: https://abc123.ngrok.io
```

#### Using Cloudflare (Free):
1. Sign up at cloudflare.com
2. Add your domain
3. Enable "Full (strict)" SSL mode
4. Your site will be automatically HTTPS

### 6. **Database Security**

#### If using MongoDB Atlas:
- Enable IP whitelisting (only your server IP)
- Enable authentication
- Use strong database passwords
- Enable audit logging

#### If using local MongoDB:
```bash
# Enable authentication
mongo
use admin
db.createUser({
  user: "admin",
  pwd: "your-strong-password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})
```

### 7. **Monitoring & Logging**

#### Enable detailed logging:
```javascript
// In backend/server.js, add:
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});
```

#### Monitor access:
- Check logs regularly for suspicious activity
- Set up alerts for failed login attempts
- Monitor resource usage

### 8. **Backup Strategy**

#### Daily backups:
```bash
# Create backup script
@echo off
set DATE=%date:~-4,4%%date:~-10,2%%date:~-7,2%
mongodump --out backup_%DATE%
```

### 9. **Update Strategy**

#### Keep dependencies updated:
```bash
# Check for updates monthly
npm audit
npm update
```

### 10. **Access Control**

#### Limit admin access:
- Use strong, unique passwords
- Enable 2FA if possible
- Monitor admin login attempts
- Consider IP whitelisting for admin access

## 🚨 **Emergency Response Plan**

### If you suspect a breach:
1. **Immediately change all passwords**
2. **Check logs for suspicious activity**
3. **Update all dependencies**
4. **Review user accounts for unauthorized access**
5. **Consider temporarily taking the service offline**

### Recovery steps:
1. **Restore from backup if needed**
2. **Update security configurations**
3. **Monitor for continued threats**
4. **Notify users if data was compromised**

## 📊 **Security Checklist**

- [ ] Changed default admin password
- [ ] Updated JWT secret
- [ ] Configured Discord bot properly
- [ ] Enabled rate limiting
- [ ] Set up firewall rules
- [ ] Enabled HTTPS/SSL
- [ ] Secured database access
- [ ] Set up monitoring
- [ ] Created backup strategy
- [ ] Updated all dependencies
- [ ] Tested security measures

## 🔍 **Regular Security Audits**

### Weekly:
- Check access logs
- Review user accounts
- Monitor resource usage
- Update dependencies

### Monthly:
- Full security review
- Backup verification
- Performance analysis
- Security updates

## 📞 **Support & Resources**

- **Security Issues**: Check logs first, then contact support
- **Performance Issues**: Monitor resource usage
- **User Issues**: Check Discord bot configuration

---

**Remember**: Security is an ongoing process, not a one-time setup. Regular monitoring and updates are essential for maintaining a secure public service.
