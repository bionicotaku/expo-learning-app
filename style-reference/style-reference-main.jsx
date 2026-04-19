// Style C main style reference for agents.
// This file carries the actual page language, component texture, and layout cues.
// Style C — Editorial Emboss (A 的暖色系 + D 的凹凸印压)
// Warm cream paper palette with soft embossed surfaces.

const C = {
  bg: '#F4EFE6',
  surface: '#FBF7EE',
  ink: '#1C1A17',
  inkSoft: '#4A453E',
  inkMute: '#8B8377',
  accent: '#C85A2C',
  accentSoft: '#F2D9C8',
  gold: '#B89454',
  cocoa: '#8E6B45',
  btnRose: '#E8B8C0',
  btnPeach: '#F2C7A7',
  btnButter: '#F2DF9C',
  btnPistachio: '#CFE0B8',
  btnLavender: '#D8CBEA',
  btnSky: '#CFE0EA',
  btnText: '#6E4E42',
  lightSh: '#FFFFFFCC',
  darkSh: '#D7CCBB',
  serif: '"Fraunces", "Source Serif Pro", Georgia, serif',
  sans: '"Inter", -apple-system, system-ui, sans-serif',
  mono: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
};

function CRaised({ children, radius = 28, pad = 0, style = {}, soft = false, bg = C.bg }) {
  const sh = soft
    ? `6px 6px 14px ${C.darkSh}, -6px -6px 14px ${C.lightSh}`
    : `10px 10px 24px ${C.darkSh}, -10px -10px 24px ${C.lightSh}`;
  return (
    <div style={{
      background: bg,
      borderRadius: radius,
      boxShadow: sh,
      padding: pad,
      ...style,
    }}>{children}</div>
  );
}

function CInset({ children, radius = 20, pad = 0, style = {}, bg = C.bg }) {
  return (
    <div style={{
      background: bg,
      borderRadius: radius,
      boxShadow: `inset 5px 5px 10px ${C.darkSh}, inset -5px -5px 10px ${C.lightSh}`,
      padding: pad,
      ...style,
    }}>{children}</div>
  );
}

function CThumb({ stats, tagLabel, h = 194, tone = 'accent' }) {
  const tones = {
    accent: [C.accent, '#DB8A62'],
    gold: [C.gold, '#D8BF8A'],
    cocoa: [C.cocoa, '#B79268'],
    warm: ['#C5A57B', '#E0C8A6'],
  };
  const [c1, c2] = tones[tone] || tones.accent;
  return (
    <div style={{
      width: '100%',
      height: h,
      borderRadius: 24,
      position: 'relative',
      overflow: 'hidden',
      background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
      boxShadow: `inset 2px 2px 4px rgba(255,255,255,0.24), inset -3px -3px 8px rgba(28,26,23,0.16)`,
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.07) 0 12px, rgba(0,0,0,0.04) 12px 24px)',
      }} />
      <div style={{
        position: 'absolute',
        left: 14,
        top: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 11px',
        borderRadius: 99,
        background: 'rgba(251,247,238,0.82)',
        backdropFilter: 'blur(10px) saturate(145%)',
        WebkitBackdropFilter: 'blur(10px) saturate(145%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 10px rgba(28,26,23,0.12)',
        fontFamily: C.mono,
        fontSize: 10,
        color: C.ink,
        letterSpacing: 0.4,
        fontWeight: 600,
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <rect x="1.25" y="2" width="9.5" height="8" rx="2.2" stroke={C.ink} strokeWidth="1.1" />
          <path d="M5 4.5L7.8 6 5 7.5V4.5z" fill={C.ink} />
        </svg>
        <span>{stats}</span>
      </div>
      <div style={{
        position: 'absolute',
        left: 14,
        right: 76,
        bottom: 14,
        padding: '8px 11px',
        borderRadius: 18,
        background: 'rgba(251,247,238,0.8)',
        backdropFilter: 'blur(10px) saturate(145%)',
        WebkitBackdropFilter: 'blur(10px) saturate(145%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.36), 0 5px 12px rgba(28,26,23,0.1)',
      }}>
        <div style={{
          fontSize: 10.5,
          lineHeight: 1.25,
          whiteSpace: 'pre-line',
          color: C.ink,
          fontWeight: 700,
          letterSpacing: 0.2,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {tagLabel}
        </div>
      </div>
      <div style={{
        position: 'absolute',
        right: 14,
        bottom: 14,
        width: 46,
        height: 46,
        borderRadius: 23,
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '4px 4px 10px rgba(28,26,23,0.22)',
      }}>
        <svg width="14" height="16" viewBox="0 0 14 16"><path d="M2 2l10 6-10 6V2z" fill={C.ink} /></svg>
      </div>
    </div>
  );
}

function CAuthModeTabs({ active }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <CInset radius={99} pad="6px">
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { key: 'password', label: '密码登录', bg: C.btnPeach },
            { key: 'code', label: '验证码登录', bg: C.btnButter },
          ].map((item) => (
            item.key === active ? (
              <CRaised key={item.key} radius={99} pad="0" soft style={{ flex: 1, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: item.bg }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.btnText, letterSpacing: 0.2 }}>{item.label}</span>
              </CRaised>
            ) : (
              <div key={item.key} style={{ flex: 1, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: C.inkSoft, whiteSpace: 'nowrap' }}>
                <span>{item.label}</span>
              </div>
            )
          ))}
        </div>
      </CInset>
    </div>
  );
}

function CAuthField({ label, value, trailing = null, marginBottom = 14, upper = true }) {
  return (
    <div style={{ marginBottom }}>
      <div style={{ fontSize: 10.5, color: C.inkMute, fontWeight: 700, letterSpacing: 1, marginBottom: 6, textTransform: upper ? 'uppercase' : 'none', fontFamily: C.mono }}>
        {label}
      </div>
      <CInset radius={18} pad="0">
        <div style={{ minHeight: 46, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, fontSize: 15, color: C.ink, fontWeight: 500 }}>{value}</div>
          {trailing}
        </div>
      </CInset>
    </div>
  );
}

function CAuthCodeRow({ label = '验证码', value = '284931', buttonBg = C.surface, marginBottom = 18, upper = false }) {
  return (
    <div style={{ marginBottom }}>
      <div style={{ fontSize: 10.5, color: C.inkMute, fontWeight: 700, letterSpacing: 1, marginBottom: 6, textTransform: upper ? 'uppercase' : 'none', fontFamily: C.mono }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
        <div style={{ flex: 1 }}>
          <CInset radius={18} pad="0">
            <div style={{ height: 46, padding: '0 16px', display: 'flex', alignItems: 'center' }}>
              <div style={{ fontSize: 15, color: C.ink, fontWeight: 500 }}>{value}</div>
            </div>
          </CInset>
        </div>
        <CRaised radius={18} pad="0" soft style={{ width: 88, height: 46, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: buttonBg }}>
          <span style={{ fontSize: 12, color: C.btnText, fontWeight: 700, whiteSpace: 'nowrap' }}>发送</span>
        </CRaised>
      </div>
    </div>
  );
}

function CAuthPrimaryButton({ children }) {
  return (
    <button style={{
      width: '100%',
      height: 56,
      borderRadius: 22,
      border: 'none',
      cursor: 'pointer',
      background: `linear-gradient(135deg, ${C.btnPeach} 0%, ${C.btnRose} 100%)`,
      color: C.btnText,
      fontFamily: C.sans,
      fontSize: 16,
      fontWeight: 700,
      letterSpacing: 0.2,
      boxShadow: `6px 6px 14px ${C.darkSh}, -4px -4px 10px ${C.lightSh}, inset 1px 1px 2px rgba(255,255,255,0.22)`,
    }}>{children}</button>
  );
}

function CAuthProviderIcon({ provider }) {
  if (provider === 'Apple') {
    return (
      <svg width="18" height="21" viewBox="0 0 18 21" fill="none" aria-hidden="true">
        <path d="M12.56 3.39c.86-1.05 1.43-2.5 1.27-3.39-1.24.08-2.74.83-3.63 1.88-.79.92-1.48 2.39-1.29 3.79 1.38.11 2.79-.71 3.65-2.28Z" fill={C.ink} />
        <path d="M16.88 14.78c-.52 1.18-.77 1.71-1.44 2.73-.94 1.41-2.26 3.17-3.89 3.18-1.45.01-1.82-.95-3.79-.94-1.97.01-2.38.96-3.83.95-1.63-.01-2.88-1.6-3.82-3.01C-2.54 13.5-.69 6.74 3.07 6.55c1.55-.08 3.01 1.05 3.96 1.05.95 0 2.72-1.29 4.6-1.1.79.03 3 .32 4.42 2.38-3.54 1.93-2.98 5.86.83 5.9Z" fill={C.ink} />
      </svg>
    );
  }

  if (provider === 'Google') {
    return (
      <svg width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden="true">
        <path d="M18.14 9.72c0-.64-.06-1.26-.18-1.86H9.69v3.52h4.73a4.06 4.06 0 0 1-1.76 2.67v2.2h2.83c1.65-1.52 2.65-3.77 2.65-6.53Z" fill={C.btnText} />
        <path d="M9.69 18.3c2.37 0 4.36-.79 5.8-2.13l-2.83-2.2c-.79.53-1.79.84-2.97.84-2.28 0-4.22-1.54-4.91-3.6H1.86v2.27A8.76 8.76 0 0 0 9.69 18.3Z" fill={C.cocoa} />
        <path d="M4.78 11.21a5.26 5.26 0 0 1 0-3.34V5.6H1.86a8.76 8.76 0 0 0 0 7.88l2.92-2.27Z" fill={C.gold} />
        <path d="M9.69 4.27c1.29 0 2.45.44 3.36 1.31l2.52-2.52C14.04 1.64 12.06.8 9.69.8A8.76 8.76 0 0 0 1.86 5.6l2.92 2.27c.69-2.06 2.63-3.6 4.91-3.6Z" fill={C.accent} />
      </svg>
    );
  }

  return (
    <svg width="21" height="18" viewBox="0 0 21 18" fill="none" aria-hidden="true">
      <path d="M6.5 0C2.9 0 0 2.43 0 5.44c0 1.73.95 3.27 2.44 4.27l-.62 2.95c-.06.28.24.5.49.35l3.39-2c.27.04.54.06.8.06 3.59 0 6.5-2.43 6.5-5.43C13 2.43 10.09 0 6.5 0Z" fill={C.cocoa} />
      <path d="M14.57 6.39c3.02 0 5.43 2.01 5.43 4.56 0 1.47-.8 2.78-2.07 3.63l.53 2.52c.05.24-.2.42-.42.29l-2.89-1.7c-.19.03-.38.04-.58.04-3.01 0-5.44-2.01-5.44-4.56 0-2.55 2.43-4.78 5.44-4.78Z" fill={C.gold} />
    </svg>
  );
}

function CAuthProviderButton({ provider }) {
  return (
    <CRaised
      radius={18}
      pad="0"
      soft
      style={{
        flex: 1,
        minWidth: 0,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: C.surface,
      }}
    >
      <CAuthProviderIcon provider={provider} />
    </CRaised>
  );
}

function CAuthSocialRow() {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0 12px' }}>
        <div style={{ flex: 1, height: 1, background: C.darkSh, opacity: 0.45 }} />
        <span style={{ fontSize: 10.5, color: C.inkMute, fontWeight: 700, letterSpacing: 1 }}>OR</span>
        <div style={{ flex: 1, height: 1, background: C.darkSh, opacity: 0.45 }} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {['Apple', 'Google', 'WeChat'].map((p) => (
          <CAuthProviderButton key={p} provider={p} />
        ))}
      </div>
    </>
  );
}

function CAuthScreen({ card, footer, showSocial = true }) {
  return (
    <div style={{ height: '100%', background: C.bg, color: C.ink, fontFamily: C.sans, display: 'flex', flexDirection: 'column', padding: '62px 24px 28px' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontFamily: C.serif, fontSize: 48, lineHeight: 0.98, letterSpacing: -1.6, fontWeight: 500 }}>
          learnability
        </div>
        <div style={{ marginTop: 16, fontSize: 14.5, color: C.inkSoft, maxWidth: 302, lineHeight: 1.58 }}>
          AI 加速学习系统
        </div>

        {card}
        {showSocial && <CAuthSocialRow />}
      </div>

      <div style={{ textAlign: 'center', fontSize: 11, color: C.inkMute, fontWeight: 500 }}>
        {footer}
      </div>
    </div>
  );
}

function CScreenLoginPassword() {
  return (
    <CAuthScreen
      footer={<><span>新用户? </span><span style={{ color: C.btnText, fontWeight: 700 }}>注册 ↗</span></>}
      card={
        <CRaised radius={32} pad="22px 22px" style={{ marginTop: 30 }}>
          <CAuthModeTabs active="password" />
          <CAuthField label="邮箱" value="mika@folio-press.app" upper={false} />
          <CAuthField label="密码" value="•••••••••••" upper={false} marginBottom={18} />
          <CAuthPrimaryButton>登录</CAuthPrimaryButton>
          <div style={{ marginTop: 14, textAlign: 'center', fontSize: 12, color: C.inkSoft, fontWeight: 500 }}>
            忘记密码?
          </div>
        </CRaised>
      }
    />
  );
}

function CScreenLoginCode() {
  return (
    <CAuthScreen
      footer={<><span>新用户? </span><span style={{ color: C.btnText, fontWeight: 700 }}>注册 ↗</span></>}
      card={
        <CRaised radius={32} pad="22px 22px" style={{ marginTop: 30 }}>
          <CAuthModeTabs active="code" />
          <CAuthField label="邮箱" value="mika@folio-press.app" upper={false} />
          <CAuthCodeRow label="验证码" value="284931" />
          <CAuthPrimaryButton>登录</CAuthPrimaryButton>
          <div style={{ marginTop: 14, textAlign: 'center', fontSize: 12, color: C.inkSoft, fontWeight: 500 }}>
            忘记密码?
          </div>
        </CRaised>
      }
    />
  );
}

function CScreenForgotPassword() {
  return (
    <CAuthScreen
      showSocial={false}
      footer={<><span>已有账号？</span><span style={{ color: C.btnText, fontWeight: 700 }}>登录 ↗</span></>}
      card={<CStructuredAuthCard title="忘记密码" />}
    />
  );
}

function CStructuredAuthCard({ title }) {
  return (
    <CRaised radius={32} pad="22px 22px" style={{ marginTop: 30 }}>
      <div style={{ marginBottom: 18, fontFamily: C.serif, fontSize: 28, lineHeight: 1.05, fontWeight: 500, letterSpacing: -0.8 }}>
        {title}
      </div>
      <CAuthField label="邮箱" value="name@learnability.app" upper={false} />
      <CAuthCodeRow label="验证码" value="284931" marginBottom={14} />
      <CAuthField label="密码" value="•••••••••••" upper={false} />
      <CAuthField label="确认密码" value="•••••••••••" upper={false} marginBottom={18} />
      <CAuthPrimaryButton>确认</CAuthPrimaryButton>
      <div style={{ marginTop: 14, textAlign: 'center', fontSize: 11.5, color: C.inkSoft, lineHeight: 1.5 }}>
        继续即表示同意 Terms & Privacy
      </div>
    </CRaised>
  );
}

function CScreenRegister() {
  return (
    <CAuthScreen
      showSocial={false}
      footer={<><span>已有账号？</span><span style={{ color: C.btnText, fontWeight: 700 }}>登录 ↗</span></>}
      card={<CStructuredAuthCard title="注册" />}
    />
  );
}

function CScreenLogin() {
  return <CScreenLoginPassword />;
}

function CTabBar({ active }) {
  const items = [
    {
      k: 'feed',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="4" width="14" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9 8l4 2.5L9 13V8z" fill="currentColor" />
        </svg>
      ),
    },
    {
      k: 'save',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5 3.5h10v13l-5-2.9-5 2.9v-13z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M7.2 7.2h5.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      k: 'me',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4 16c.7-3 3.2-4.8 6-4.8s5.3 1.8 6 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ),
    },
  ];
  return (
    <div style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 18,
      zIndex: 20,
      padding: '0 22px',
    }}>
      <div style={{
        display: 'flex',
        padding: 6,
        borderRadius: 30,
        background: 'rgba(251,247,238,0.42)',
        backdropFilter: 'blur(18px) saturate(160%)',
        WebkitBackdropFilter: 'blur(18px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.58)',
        boxShadow: '0 10px 26px rgba(28,26,23,0.12), inset 0 1px 0 rgba(255,255,255,0.65)',
      }}>
        {items.map((i) => {
          const on = i.k === active;
          return on ? (
            <div key={i.k} style={{
              flex: 1,
              height: 48,
              borderRadius: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.btnText,
              background: i.k === 'feed'
                ? 'rgba(242,199,167,0.52)'
                : i.k === 'save'
                  ? 'rgba(242,223,156,0.52)'
                  : 'rgba(207,224,234,0.52)',
              backdropFilter: 'blur(12px) saturate(150%)',
              WebkitBackdropFilter: 'blur(12px) saturate(150%)',
              border: '1px solid rgba(255,255,255,0.42)',
              boxShadow: '0 6px 14px rgba(28,26,23,0.08), inset 0 1px 0 rgba(255,255,255,0.55)',
            }}>
              {i.icon}
            </div>
          ) : (
            <div key={i.k} style={{
              flex: 1,
              height: 48,
              borderRadius: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.inkSoft,
            }}>
              {i.icon}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CFeedCard({ title, views, dur, tone, tagLabel }) {
  return (
    <CRaised radius={28} pad={10} style={{ marginBottom: 16 }}>
      <CThumb stats={`${views} · ${dur}`} tagLabel={tagLabel} h={196} tone={tone} />
      <div style={{ padding: '14px 10px 8px' }}>
        <div style={{
          fontFamily: C.serif,
          fontWeight: 500,
          fontSize: 21,
          lineHeight: 1.2,
          letterSpacing: -0.45,
          color: C.ink,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.4em',
        }}>
          {title}
        </div>
      </div>
    </CRaised>
  );
}

function CScreenFeed() {
  const items = [
    {
      title: 'The sentence that sounds literary at first, then surprisingly usable in everyday conversation.',
      views: '24.8k',
      dur: '03:18',
      tone: 'cocoa',
      tagLabel: 'cinema tone\nB2 everyday lift',
    },
    {
      title: 'A sharp interview phrase with editorial rhythm that still lands in normal speech.',
      views: '12.6k',
      dur: '01:04',
      tone: 'gold',
      tagLabel: 'interview cadence\nA useful opener',
    },
    {
      title: 'A news line that becomes memorable because the cadence does half the work for you.',
      views: '9.3k',
      dur: '00:52',
      tone: 'accent',
      tagLabel: 'news emphasis\nB1-B2 retention',
    },
    {
      title: 'A small expression that carries more weight than it looks once the timing is right.',
      views: '7.8k',
      dur: '00:47',
      tone: 'warm',
      tagLabel: 'micro phrase\nsoft dramatic use',
    },
  ];

  return (
    <div style={{ height: '100%', background: C.bg, color: C.ink, fontFamily: C.sans, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: '0 22px 116px' }}>
        <div style={{ padding: '58px 0 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 12, color: C.inkMute, fontWeight: 600, letterSpacing: 0.3 }}>Thursday · Apr 18</div>
              <div style={{ fontFamily: C.serif, fontSize: 34, letterSpacing: -1.1, marginTop: 2, fontWeight: 500 }}>Reading Room</div>
            </div>
            <CRaised radius={22} soft style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="8" cy="8" r="5.5" stroke={C.ink} strokeWidth="1.6" /><path d="M13 13l3 3" stroke={C.ink} strokeWidth="1.6" strokeLinecap="round" /></svg>
            </CRaised>
          </div>
        </div>

        {items.map((item) => (
          <CFeedCard key={`${item.title}-${item.dur}`} {...item} />
        ))}
      </div>

      <CTabBar active="feed" />
    </div>
  );
}

function CVideoAction({ icon }) {
  return (
    <div>
      <CRaised radius={999} pad="0" soft style={{
        width: 54,
        height: 54,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(251,247,238,0.16)',
        backdropFilter: 'blur(14px) saturate(135%)',
        WebkitBackdropFilter: 'blur(14px) saturate(135%)',
        boxShadow: '5px 8px 14px rgba(17,13,10,0.14), inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -2px 5px rgba(17,13,10,0.08)',
      }}>
        <div style={{ filter: 'drop-shadow(1px 2px 1px rgba(17,13,10,0.16))' }}>
          {icon}
        </div>
      </CRaised>
    </div>
  );
}

function CScreenVideoFull() {
  return (
    <div style={{
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #F4EFE6 0%, #EEE5D8 52%, #E5D8C7 100%)',
      color: C.ink,
      fontFamily: C.sans,
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 22% 24%, rgba(242,199,167,0.46) 0%, rgba(242,199,167,0.14) 24%, rgba(0,0,0,0) 46%), radial-gradient(circle at 78% 72%, rgba(216,203,234,0.3) 0%, rgba(216,203,234,0.08) 22%, rgba(0,0,0,0) 42%), linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(28,26,23,0.04) 100%)',
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.08) 0 18px, rgba(0,0,0,0.03) 18px 36px)',
        mixBlendMode: 'soft-light',
      }} />
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 182,
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 42%, rgba(0,0,0,0.2) 74%, rgba(0,0,0,0.28) 100%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'absolute', left: 22, right: 22, top: 64, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <CVideoAction
          icon={
            <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
              <path d="M11.5 4.5L7 9l4.5 4.5" stroke="rgba(251,247,238,0.96)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
      </div>

      <div style={{ position: 'absolute', right: 18, bottom: 142, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
        <CVideoAction
          icon={
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <path d="M10 16.5l-5.06-4.7C2.1 9.2 2 5.76 4.5 4.1c1.86-1.24 4.1-.5 5.5 1.1 1.4-1.6 3.64-2.34 5.5-1.1 2.5 1.66 2.4 5.1-.44 7.7L10 16.5z" fill="rgba(251,247,238,0.96)" />
            </svg>
          }
        />
        <CVideoAction
          icon={
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <path d="M10 3.1l2.15 4.34 4.79.69-3.47 3.39.82 4.76L10 14l-4.29 2.28.82-4.76L3.06 8.13l4.79-.69L10 3.1z" fill="rgba(251,247,238,0.96)" />
            </svg>
          }
        />
        <CVideoAction
          icon={
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 4.5h3v3M8 12l7.2-7.2M15.2 11.2v3.3a1.5 1.5 0 01-1.5 1.5H5.5A1.5 1.5 0 014 14.5V6.3a1.5 1.5 0 011.5-1.5h3.3" stroke="rgba(251,247,238,0.96)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <CVideoAction
          icon={
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <rect x="3.2" y="5" width="13.6" height="10" rx="3" stroke="rgba(251,247,238,0.96)" strokeWidth="1.4" />
              <path d="M6.8 9.2h2.5M6.8 11.8h5.7M11.5 9.2h1.7" stroke="rgba(251,247,238,0.96)" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          }
        />
      </div>

      <div style={{ position: 'absolute', left: 22, right: 92, bottom: 40 }}>
        <div style={{
          fontFamily: C.sans,
          fontSize: 14.5,
          lineHeight: 1.52,
          letterSpacing: -0.08,
          fontWeight: 700,
          color: 'rgba(251,247,238,0.97)',
          textShadow: '0 1px 3px rgba(17,13,10,0.24)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginBottom: 12,
          maxWidth: 260,
        }}>
          The line that sounds cinematic, but slips naturally into real conversation.
        </div>
        <div style={{
          fontSize: 13.5,
          lineHeight: 1.58,
          color: 'rgba(251,247,238,0.9)',
          textShadow: '0 1px 3px rgba(17,13,10,0.22)',
          maxWidth: 248,
        }}>
          Tone and timing notes that make the phrase easier to use.
        </div>
      </div>

      <div style={{ position: 'absolute', left: 22, right: 22, bottom: 28 }}>
        <div style={{
          height: 4,
          borderRadius: 999,
          background: 'rgba(251,247,238,0.24)',
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 2px rgba(17,13,10,0.14)',
        }}>
          <div style={{
            width: '38%',
            height: '100%',
            borderRadius: 999,
            background: 'rgba(251,247,238,0.96)',
            boxShadow: '0 0 4px rgba(17,13,10,0.16)',
          }} />
        </div>
      </div>
    </div>
  );
}

function CVocabCard({ word, ipa, meaning, progress, accentColor, bg }) {
  return (
    <CRaised radius={24} pad="14px 16px" soft style={{ marginBottom: 12, background: bg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ fontFamily: C.serif, fontSize: 28, fontWeight: 500, letterSpacing: -0.8 }}>{word}</div>
          <div style={{ marginTop: 4, fontFamily: C.mono, fontSize: 11, color: C.inkMute }}>{ipa}</div>
        </div>
        <CRaised radius={999} pad="0" soft style={{ background: C.surface, width: 34, height: 34, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M7 1.6l1.5 3.02 3.33.48-2.41 2.35.57 3.32L7 9.17l-2.99 1.6.57-3.32-2.41-2.35 3.33-.48L7 1.6z"
              fill={accentColor}
              stroke={accentColor}
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
          </svg>
        </CRaised>
      </div>
      <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.58, color: C.inkSoft }}>{meaning}</div>
      <div style={{ marginTop: 12, height: 8, borderRadius: 999, background: 'rgba(28,26,23,0.08)', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: accentColor }} />
      </div>
    </CRaised>
  );
}

function CScreenVocab() {
  return (
    <div style={{ height: '100%', background: C.bg, color: C.ink, fontFamily: C.sans, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: '0 22px 116px' }}>
        <div style={{ padding: '58px 0 14px' }}>
          <div style={{ fontSize: 12, color: C.inkMute, fontWeight: 600 }}>Collected notes</div>
          <div style={{ fontFamily: C.serif, fontSize: 34, letterSpacing: -1.1, marginTop: 2, fontWeight: 500 }}>Clippings</div>
        </div>

        <div style={{ paddingBottom: 12 }}>
          <CInset radius={99} pad="6px">
            <div style={{ display: 'flex', gap: 4 }}>
              <CRaised radius={99} pad="0" soft style={{ flex: 1, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.btnPeach }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.btnText }}>All 196</span>
              </CRaised>
              <div style={{ flex: 1, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: C.inkSoft, whiteSpace: 'nowrap' }}>
                <span>Fresh</span>
              </div>
              <div style={{ flex: 1, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: C.inkSoft, whiteSpace: 'nowrap' }}>
                <span>Reviewed</span>
              </div>
            </div>
          </CInset>
        </div>

        <CVocabCard
          word="carry weight"
          ipa="/ˈkæri weɪt/"
          meaning="to sound meaningful because the speaker or source gives the sentence authority."
          progress={74}
          accentColor={C.btnRose}
          bg="#F8F2EA"
        />
        <CVocabCard
          word="land on"
          ipa="/lænd ɒn/"
          meaning="to arrive at an answer, phrase, or idea that finally feels right."
          progress={55}
          accentColor={C.btnButter}
          bg="#F6EFE4"
        />
        <CVocabCard
          word="read the room"
          ipa="/riːd ðə ruːm/"
          meaning="to understand the atmosphere before you speak."
          progress={41}
          accentColor={C.btnPeach}
          bg="#F5EEE5"
        />
      </div>

      <CTabBar active="save" />
    </div>
  );
}

function CMenuGroup({ items }) {
  return (
    <CRaised radius={24} pad={8} soft style={{ marginBottom: 12 }}>
      {items.map((it, i, a) => (
        <div key={it.t} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 10px',
          borderBottom: i === a.length - 1 ? 'none' : `1px dashed ${C.darkSh}`,
        }}>
          <CRaised radius={14} soft style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: it.bg }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">{it.icon}</svg>
          </CRaised>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: it.danger ? C.btnText : C.ink }}>{it.t}</span>
          {it.r && <span style={{ fontSize: 11, color: C.inkMute, fontWeight: 600 }}>{it.r}</span>}
          {!it.danger && <span style={{ color: C.inkMute, fontSize: 14 }}>›</span>}
        </div>
      ))}
    </CRaised>
  );
}

function CScreenMe() {
  return (
    <div style={{ height: '100%', background: C.bg, color: C.ink, fontFamily: C.sans, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: '0 22px 116px' }}>
        <div style={{ padding: '58px 0 14px' }}>
          <CRaised radius={28} pad="16px 16px" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 70, height: 70, borderRadius: 26, background: `linear-gradient(135deg, ${C.btnPeach} 0%, ${C.btnRose} 100%)`, boxShadow: `inset 2px 2px 4px rgba(255,255,255,0.24), inset -3px -3px 6px rgba(28,26,23,0.16)` }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: C.serif, fontSize: 30, fontWeight: 500, letterSpacing: -0.8 }}>Mika</div>
              <div style={{ fontSize: 12, color: C.inkMute, fontWeight: 600, marginTop: 4 }}>Issue desk · editorial mode</div>
            </div>
            <CRaised radius={99} pad="8px 12px" soft>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.btnText }}>22 day streak</span>
            </CRaised>
          </CRaised>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
          {[
            { t: 'Saved', v: '196', c: C.btnRose },
            { t: 'Reviewed', v: '81', c: C.btnButter },
            { t: 'Hours', v: '16', c: C.btnPeach },
          ].map((it) => (
            <CRaised key={it.t} radius={22} pad="12px 10px" soft>
              <div style={{ fontSize: 10, color: C.inkMute, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>{it.t}</div>
              <div style={{ marginTop: 8, fontFamily: C.serif, fontSize: 28, lineHeight: 1, fontWeight: 500, letterSpacing: -1, color: it.c }}>{it.v}</div>
            </CRaised>
          ))}
        </div>

        <CRaised radius={24} pad="16px 16px" soft style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: C.serif, fontSize: 20, fontWeight: 500 }}>Week issue</div>
            <CRaised radius={99} pad="7px 14px" soft style={{ background: C.btnLavender }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.btnText }}>steady</span>
            </CRaised>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 110 }}>
            {[40, 74, 56, 82, 68, 48, 78].map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: '100%',
                  height: h,
                  borderRadius: 12,
                  background: [C.btnRose, C.btnButter, C.btnPeach, C.btnLavender, C.btnSky, C.btnPeach, C.btnRose][i],
                }} />
                <div style={{ fontFamily: C.mono, fontSize: 9, color: C.inkMute }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</div>
              </div>
            ))}
          </div>
        </CRaised>

        <CMenuGroup items={[
          {
            t: 'Archive',
            r: '132 clips',
            bg: '#F8F2EA',
            icon: <path d="M3 4h10v8H3V4zm1 1v6h8V5H4zm2 8h4" stroke={C.accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />,
          },
          {
            t: 'Favorites',
            r: '58 words',
            bg: '#F6EFE4',
            icon: <path d="M8 12.5l-3.7-2.9A2.7 2.7 0 014 5.2a2.5 2.5 0 013.9-.6l.1.1.1-.1A2.5 2.5 0 0112 5.2a2.7 2.7 0 01-.3 4.4L8 12.5z" stroke={C.gold} strokeWidth="1.4" strokeLinejoin="round" />,
          },
          {
            t: 'Review queue',
            r: '10 due',
            bg: '#F5EEE5',
            icon: <><path d="M8 3v5l3 2" stroke={C.cocoa} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><circle cx="8" cy="8" r="5" stroke={C.cocoa} strokeWidth="1.4" /></>,
          },
        ]} />

        <CMenuGroup items={[
          {
            t: 'Preferences',
            bg: C.surface,
            icon: <><path d="M8 3.5l1 .4.9-.5 1 1-.5.9.4 1 .9.5v1.4l-.9.5-.4 1 .5.9-1 1-.9-.5-1 .4-.5.9H7l-.5-.9-1-.4-.9.5-1-1 .5-.9-.4-1-.9-.5V7.3l.9-.5.4-1-.5-.9 1-1 .9.5 1-.4.5-.9h1l.5.9z" stroke={C.inkSoft} strokeWidth="1.1" strokeLinejoin="round" /><circle cx="8" cy="8" r="1.8" stroke={C.inkSoft} strokeWidth="1.1" /></>,
          },
          {
            t: 'Reading goals',
            bg: '#F8F2EA',
            icon: <path d="M3 11l3-3 2 2 5-5" stroke={C.accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />,
          },
          {
            t: 'Help & feedback',
            bg: '#F6EFE4',
            icon: <path d="M6.5 6.2a1.9 1.9 0 013 1.5c0 1.2-1.5 1.5-1.5 2.8M8 11.8h.01" stroke={C.gold} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />,
          },
          {
            t: 'Sign out',
            danger: true,
            bg: '#F5EEE5',
            icon: <path d="M6 4H4.5A1.5 1.5 0 003 5.5v5A1.5 1.5 0 004.5 12H6m2-2 2-2-2-2m2 2H6" stroke={C.accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />,
          },
        ]} />

        <div style={{ textAlign: 'center', padding: '18px 0 10px', fontSize: 10.5, color: C.inkMute, fontWeight: 600, letterSpacing: 0.8 }}>
          Folio Press · v0.5
        </div>
      </div>

      <CTabBar active="me" />
    </div>
  );
}

Object.assign(window, {
  CScreenLogin,
  CScreenLoginPassword,
  CScreenLoginCode,
  CScreenForgotPassword,
  CScreenRegister,
  CScreenFeed,
  CScreenVideoFull,
  CScreenVocab,
  CScreenMe,
});
