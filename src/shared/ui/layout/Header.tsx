import Image from 'next/image'
import Link from 'next/link'
import { nicomoji } from '@/shared/lib/fonts'
import {
	FaPaypal,
	FaRegUserCircle,
	FaYoutube,
	IoHomeOutline,
	LuMenu,
	MdOutlineEditCalendar,
	RxCountdownTimer,
} from '@/shared/ui/icons'
import HeaderIcon from './HeaderIcon'

const MenuLinks = [
	{ id: 'home', href: '/home', label: 'ホーム', icon: IoHomeOutline },
	{
		id: 'booking',
		href: '/booking',
		label: 'コマ表',
		icon: MdOutlineEditCalendar,
	},
	{ id: 'video', href: '/video', label: '過去動画', icon: FaYoutube },
	{
		id: 'log',
		href: '/booking/logs',
		label: '予約ログ',
		icon: RxCountdownTimer,
	},
	{
		id: 'signin',
		href: '/auth/signin',
		label: '利用登録',
		icon: FaRegUserCircle,
	},
	{
		id: 'paypal',
		href: 'https://paypal.me/watabeggg?locale.x=ja_JP&country.x=JP',
		label: 'わたべに投げ銭する',
		icon: FaPaypal,
	},
] as const

const Header = async () => {
	const drawerId = 'main-menu-drawer'

	return (
		<header className="drawer">
			<input id={drawerId} type="checkbox" className="drawer-toggle" />
			<div className="drawer-content fixed top-3 left-0 z-40 w-full px-2">
				<div className="navbar rounded-xl bg-white/70 shadow-lg backdrop-blur-sm">
					<div className="navbar-start md:pl-5">
						<label
							htmlFor={drawerId}
							className="btn btn-square btn-ghost drawer-button"
						>
							<LuMenu className="text-3xl" />
						</label>
					</div>
					<div className="navbar-center">
						<Link href="/home">
							<p
								className={`hidden text-center text-3xl md:block ${nicomoji.className}`}
							>
								あしたぼホームページ
							</p>
							<Image
								src="/logo.png"
								alt="あしたぼホームページ"
								width={50}
								height={50}
								className="md:hidden"
								unoptimized
							/>
						</Link>
					</div>
					<div className="navbar-end md:pr-5">
						<HeaderIcon />
					</div>
				</div>
			</div>
			<div className="drawer-side z-50">
				<label
					htmlFor={drawerId}
					aria-label="close sidebar"
					className="drawer-overlay"
				></label>
				<ul className="menu fixed top-3 bottom-3 left-3 w-64 rounded-xl bg-base-100 p-4 text-base-content">
					<li className="text-2xl">
						<div className={`mb-2 font-bold ${nicomoji.className}`}>
							あしたぼホームページ
						</div>
					</li>
					{MenuLinks.map((link) => (
						<li
							key={link.href}
							className={link.id === 'paypal' ? 'gaming' : ''}
						>
							<Link
								href={link.href}
								className={`flex items-center gap-4 text-lg ${link.id === 'paypal' ? 'inner' : ''}`}
							>
								<link.icon />
								{link.label}
							</Link>
						</li>
					))}
				</ul>
			</div>
		</header>
	)
}

export default Header
