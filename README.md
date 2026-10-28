# Lin Atelier：艺术家作品集网站

Next.js 15 · React · TypeScript · Tailwind CSS · Supabase（数据库、登录、图片存储）· 部署在 Vercel

艺术家登录 `/admin` 后，可以上传作品图片、编辑、删除、调整顺序、设为精选、发布或下线。**所有改动不需要改代码**，保存后几秒内就会出现在公开网站上。

---

## 一、先在电脑上看效果（不需要 Supabase）

```bash
npm install
npm run dev
```

打开 http://localhost:3000。此时网站使用内置的 8 件演示作品，`/admin` 会提示“Connect Supabase”。

---

## 二、上线步骤（约 20 分钟）

### A. 创建 Supabase 项目

1. 登录 [supabase.com](https://supabase.com)，点 **New project**。设置并记下数据库密码，地区选离访客近的。
2. 左侧 **SQL Editor** → **New query**，把 `supabase/schema.sql` 的全部内容粘贴进去，点 **Run**。这会创建作品表、留言表、图片存储桶和所有权限规则。
3. 想马上看到 8 件演示作品：再新建一个 query，粘贴 `supabase/seed.sql`，点 **Run**。（之后可以在后台删掉这些演示作品。）
4. 左侧 **Authentication → Users → Add user → Create new user**，填入艺术家的邮箱和密码，勾选 **Auto Confirm User**。这就是 `/admin` 的登录账号。
5. **重要**：在 **Authentication** 的登录设置里（Sign In / Providers，或 Sign In / Up），关闭 **Allow new users to sign up**。否则任何人都能自己注册账号并进入后台。
6. **Project Settings → API**，复制两个值：**Project URL**，以及 **anon public key**（新版界面里叫 publishable key，用哪个都行）。

### B. 部署到 Vercel

1. 把这个文件夹上传到 GitHub：新建一个仓库（建议设为 Private），然后在项目文件夹里运行：
   ```bash
   git init && git add . && git commit -m "Lin Atelier"
   git branch -M main
   git remote add origin https://github.com/你的用户名/仓库名.git
   git push -u origin main
   ```
2. 登录 [vercel.com](https://vercel.com) → **Add New → Project** → 选择刚才的仓库 → **Import**。
3. 展开 **Environment Variables**，添加三项：

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | 上一步复制的 Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 上一步复制的 anon / publishable key |
   | `NEXT_PUBLIC_SITE_URL` | 先填 `https://你的项目名.vercel.app`，绑定自己的域名后改成域名 |

4. 点 **Deploy**。完成后访问网址，再打开 `/admin/login` 用第 4 步的账号登录。
5. 如果之后修改了 `NEXT_PUBLIC_SITE_URL`，在 Vercel 里点 **Redeploy**，让分享预览和 sitemap 用上新地址。

### C. 绑定自己的域名（可选）

Vercel 项目 → **Settings → Domains** → 输入域名，按提示在域名服务商处添加解析记录。

---

## 三、艺术家怎么用后台

登录 `/admin`：

- **添加作品**：左侧表单选择图片（JPG / PNG / WebP），会先显示预览；填写标题、年份、媒介、尺寸、说明；“Collection / Series”可以从已有系列里选，也可以直接输入新名字；点 **Publish artwork**。新作品排在最前面。
- **编辑**：点作品右侧的 **Edit**，改完点 **Save changes**。选一张新图片就会替换旧图。
- **顺序**：**↑ Up / ↓ Down**。这里的顺序就是网站上的顺序。
- **精选**：**Feature** 的作品会出现在首页（第一件精选作品是首页大图）。
- **上下线**：**Unpublish** 后作品变成草稿，访客看不到；**Publish** 重新上线。
- **删除**：点两次 **Delete**，会同时删除数据库记录和图片文件。
- **留言**：访客通过联系表单发来的消息在 **Inquiries** 页查看。

图片会在浏览器里自动处理：生成最长边 2400px 的高清版（作品页和全屏查看用）和 900px 的缩略图（作品墙和首页用），并转成 WebP。建议上传已经裁好、只有画面本身的图片。

---

## 四、需要替换的内容

全部在一个文件里：`src/lib/site.ts`。

- `email`：目前是占位的 `studio@example.com`
- `instagram`：目前是占位账号，`url` 留空时只显示文字，填上链接就变成可点击
- `exhibitions`、`awards`：目前是占位条目。**上线前请改成真实内容，或删成空数组 `[]` 隐藏这一栏**
- `bio`、`statement`、`intro`：艺术家简介和文案
- `cvUrl`：把 PDF 放进 `public/`（例如 `public/cv.pdf`），填 `'/cv.pdf'`，About 页就会出现下载链接
- About 页的图片是工作室照片，换成人像只需替换 `public/about/studio.webp`

网站标题、描述、Open Graph 分享图、每件作品的独立网址和 `sitemap.xml` 都会自动生成。

---

## 五、项目结构

```
supabase/schema.sql        数据库、权限规则、图片存储（先运行）
supabase/seed.sql          8 件演示作品（可选）
public/artworks/           演示作品的图片（高清版 + 缩略图）
src/lib/site.ts            艺术家姓名、联系方式、About 文案
src/app/(site)/            公开页面：首页、作品、作品详情、关于、联系
src/app/admin/             后台：登录、作品管理、留言
src/components/admin/      后台的上传、编辑、排序界面
src/lib/image.ts           浏览器端图片优化
src/middleware.ts          没登录时把 /admin 重定向到登录页
```

---

## 六、安全说明

- 后台页面由 `middleware.ts` 拦截；真正的保护是数据库的 Row Level Security：访客只能读取已发布作品，只有登录用户能增删改作品和图片。
- 因为规则是“已登录即管理员”，所以必须关闭 Supabase 的公开注册（见 A 第 5 步）。
- 联系表单有隐藏的蜜罐字段挡掉大部分机器人，数据库对留言长度也有限制。
- 密钥只用 anon / publishable key，它本来就是公开的，不要把 `service_role` key 放进任何环境变量。

## 常见问题

- **后台登录后作品列表是空的**：确认运行过 `schema.sql`；确认 Vercel 里的两个 Supabase 变量没有多余空格。
- **新作品没出现在网站上**：公开页面有 60 秒缓存，后台保存时会主动刷新；如果仍未更新，稍等一分钟后刷新页面。
- **上传报错**：检查 `schema.sql` 是否已完整运行（需要 `artworks` 存储桶和它的权限规则）。
- **Supabase 免费项目长期没人访问会被暂停**，网站会显示空白作品墙。到 Supabase 控制台点 **Restore** 即可恢复；需要长期稳定可以升级套餐。
- **想换回只看演示**：删掉两个 Supabase 环境变量即可，网站自动回到内置演示数据。
