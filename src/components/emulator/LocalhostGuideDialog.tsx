"use client";

import {
	AlertTriangle,
	Check,
	CheckCircle2,
	Copy,
	ExternalLink,
	Globe,
	Info,
	Laptop,
	Play,
	RefreshCw,
	Server,
	ShieldAlert,
	ShieldCheck,
	Terminal,
	Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useActiveCharger } from "@/hooks/useActiveCharger";

/* ── Copy Button ── */
function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);
	return (
		<button
			type="button"
			onClick={() => {
				navigator.clipboard.writeText(text);
				setCopied(true);
				setTimeout(() => setCopied(false), 1500);
			}}
			className="shrink-0 p-1 rounded hover:bg-white/10 text-[#6b7898] hover:text-white transition-colors cursor-pointer"
			title="Copy to clipboard"
		>
			{copied ? (
				<Check className="h-3 w-3 text-emerald-400" />
			) : (
				<Copy className="h-3 w-3" />
			)}
		</button>
	);
}

/* ── Props ── */
export interface LocalhostGuideDialogProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	trigger?: React.ReactNode;
}

export function LocalhostGuideDialog({
	open,
	onOpenChange,
	trigger,
}: LocalhostGuideDialogProps = {}) {
	const { config, updateConfig } = useActiveCharger();
	const [activeTab, setActiveTab] = useState<
		"permission" | "tester" | "tunnel"
	>("permission");
	const [browser, setBrowser] = useState<"chromium" | "firefox" | "safari">(
		"chromium",
	);

	/* Detect origin & environment */
	const [isHttps, setIsHttps] = useState(false);
	const [isLocalOrigin, setIsLocalOrigin] = useState(false);
	const [originUrl, setOriginUrl] = useState("");
	const [permissionState, setPermissionState] = useState<
		"unknown" | "granted" | "prompt" | "denied" | "unsupported"
	>("unknown");

	/* Port tester state */
	const initialPort = (() => {
		try {
			const match = config.endpoint.match(/:(\d+)/);
			return match ? match[1] : "9000";
		} catch {
			return "9000";
		}
	})();

	const [testPort, setTestPort] = useState(initialPort);
	const [testStatus, setTestStatus] = useState<
		"idle" | "testing" | "success" | "blocked" | "error"
	>("idle");
	const [testMessage, setTestMessage] = useState("");
	const [testLatency, setTestLatency] = useState<number | null>(null);
	const [applied, setApplied] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;
		setIsHttps(window.location.protocol === "https:");
		setIsLocalOrigin(
			window.location.hostname === "localhost" ||
				window.location.hostname === "127.0.0.1",
		);
		setOriginUrl(window.location.origin);

		const ua = navigator.userAgent.toLowerCase();
		if (ua.includes("firefox")) {
			setBrowser("firefox");
		} else if (
			ua.includes("safari") &&
			!ua.includes("chrome") &&
			!ua.includes("chromium")
		) {
			setBrowser("safari");
		} else {
			setBrowser("chromium");
		}

		if (navigator.permissions?.query) {
			let cancelled = false;
			const queryPerm = async () => {
				try {
					const p = await navigator.permissions.query({
						name: "loopback-network" as unknown as PermissionName,
					});
					if (!cancelled && p) {
						setPermissionState(p.state);
						p.onchange = () => {
							if (!cancelled) setPermissionState(p.state);
						};
						return;
					}
				} catch {
					try {
						const p2 = await navigator.permissions.query({
							name: "local-network" as unknown as PermissionName,
						});
						if (!cancelled && p2) {
							setPermissionState(p2.state);
							p2.onchange = () => {
								if (!cancelled) setPermissionState(p2.state);
							};
							return;
						}
					} catch {
						if (!cancelled) setPermissionState("unsupported");
					}
				}
			};
			queryPerm();
			return () => {
				cancelled = true;
			};
		}
	}, []);

	/* Test connection tester */
	const runTestConnection = useCallback((portToTest: string) => {
		setTestStatus("testing");
		setTestMessage("");
		setTestLatency(null);
		setApplied(false);

		const cleanPort = portToTest.trim() || "9000";
		const targetWsUrl = `ws://localhost:${cleanPort}`;
		const startTime = performance.now();
		let finished = false;

		try {
			const ws = new WebSocket(targetWsUrl);

			const timeoutId = setTimeout(() => {
				if (!finished) {
					finished = true;
					try {
						ws.close();
					} catch {}
					setTestStatus("error");
					setTestMessage(
						`Connection timed out. Ensure your CSMS is running and listening on port ${cleanPort}.`,
					);
				}
			}, 3000);

			ws.onopen = () => {
				if (finished) return;
				finished = true;
				clearTimeout(timeoutId);
				const elapsed = Math.round(performance.now() - startTime);
				setTestLatency(elapsed);
				setTestStatus("success");
				setTestMessage(
					`Successfully connected to local WebSocket server on port ${cleanPort} (${elapsed}ms).`,
				);
				try {
					ws.close();
				} catch {}
			};

			ws.onerror = () => {
				if (finished) return;
				finished = true;
				clearTimeout(timeoutId);
				const elapsed = Math.round(performance.now() - startTime);
				const isCurrentHttps =
					typeof window !== "undefined" &&
					window.location.protocol === "https:";

				if (isCurrentHttps && elapsed < 80) {
					setTestStatus("blocked");
					setTestMessage(
						`Blocked by browser security. Insecure WebSocket (ws://) from HTTPS was blocked. Allow "Insecure content" in site settings.`,
					);
				} else {
					setTestStatus("error");
					setTestMessage(
						`Failed to reach port ${cleanPort}. Verify your CSMS is running and listening.`,
					);
				}
			};

			ws.onclose = (ev) => {
				if (finished) return;
				finished = true;
				clearTimeout(timeoutId);
				const elapsed = Math.round(performance.now() - startTime);
				const isCurrentHttps =
					typeof window !== "undefined" &&
					window.location.protocol === "https:";

				if (isCurrentHttps && elapsed < 80 && ev.code === 1006) {
					setTestStatus("blocked");
					setTestMessage(
						`Browser blocked the connection (code 1006). Allow "Insecure content" in site settings.`,
					);
				} else {
					setTestStatus("error");
					setTestMessage(
						`WebSocket closed immediately (code ${ev.code}). Ensure your CSMS is running on port ${cleanPort}.`,
					);
				}
			};
		} catch (err: unknown) {
			setTestStatus("blocked");
			setTestMessage(
				err instanceof Error
					? err.message
					: "Browser security blocked creating WebSocket to localhost.",
			);
		}
	}, []);

	const isLocalhostActive =
		config.endpoint.includes("localhost") ||
		config.endpoint.includes("127.0.0.1");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{trigger ? (
				<DialogTrigger render={trigger as React.ReactElement} />
			) : (
				<DialogTrigger
					className={`h-8 px-2.5 rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer shrink-0 ${
						isLocalhostActive
							? "bg-[#18122c] border-[#8b5cf6]/40 text-[#c4b5fd] hover:border-[#8b5cf6] hover:bg-[#20153d]"
							: "bg-[#0f1117] border-[#232636] text-[#6b7898] hover:text-[#a0a8b8] hover:border-[#2d3050] hover:bg-[#13151f]"
					}`}
					title="Connect to Localhost Guide & Browser Permissions"
				>
					<Globe
						className={`h-3.5 w-3.5 ${
							isLocalhostActive
								? "text-[#a78bfa]"
								: "text-[#6b7898]"
						}`}
					/>
					<span className="text-[11px] font-medium hidden md:inline">
						Localhost
					</span>
					{isLocalhostActive && (
						<span className="relative flex h-1.5 w-1.5">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
							<span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
						</span>
					)}
				</DialogTrigger>
			)}

			<DialogContent
				showCloseButton
				className="w-[95vw] sm:max-w-2xl bg-[#12141e] border border-[#26293b] shadow-[0_24px_80px_rgba(0,0,0,0.85)] rounded-2xl p-0 flex flex-col overflow-hidden text-white"
			>
				{/* Header */}
				<DialogHeader className="px-6 pt-5 pb-3 border-b border-[#1f2233] bg-[#161826]">
					<div className="flex items-center gap-3">
						<div className="h-8 w-8 rounded-lg bg-[#22183b] border border-[#8b5cf6]/40 flex items-center justify-center text-[#c4b5fd] shrink-0">
							<Globe className="h-4 w-4 text-[#a78bfa]" />
						</div>
						<div>
							<DialogTitle className="text-[14px] font-bold text-white tracking-tight flex items-center gap-2">
								Connect to Localhost
								<span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 text-[#c4b5fd]">
									ws://localhost
								</span>
							</DialogTitle>
							<DialogDescription className="text-[#7d8ba7] text-[11px] mt-0.5">
								How to connect this simulator directly to your
								local CSMS backend.
							</DialogDescription>
						</div>
					</div>

					{/* Environment Status Strip */}
					<div className="mt-3 flex items-center justify-between text-[11px] px-3 py-1.5 rounded-lg bg-[#0e1017] border border-[#202334]">
						<div className="flex items-center gap-2 min-w-0">
							<span
								className={`h-2 w-2 rounded-full shrink-0 ${
									isLocalOrigin
										? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
										: isHttps
											? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
											: "bg-blue-400"
								}`}
							/>
							<span className="text-[#a0a8b8] font-mono text-[10px] truncate">
								{originUrl || "Origin"}
							</span>
							<span className="text-[#3b4158]">•</span>
							<span className="text-white text-[10px] font-medium truncate">
								{isLocalOrigin
									? "Localhost (Direct Access Permitted)"
									: isHttps
										? "Hosted HTTPS (Permission Required)"
										: "Standard Context"}
							</span>
						</div>

						{permissionState === "granted" && (
							<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-semibold shrink-0">
								<Check className="h-2.5 w-2.5" /> Allowed
							</span>
						)}
					</div>
				</DialogHeader>

				{/* Sleek Segmented Control */}
				<div className="px-6 pt-3">
					<div className="flex p-1 rounded-xl bg-[#0c0e15] border border-[#1f2233] gap-1">
						<button
							type="button"
							onClick={() => setActiveTab("permission")}
							className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
								activeTab === "permission"
									? "bg-[#201838] text-[#c4b5fd] border border-[#8b5cf6]/40 shadow-xs"
									: "text-[#6b7898] hover:text-[#a0a8b8]"
							}`}
						>
							<ShieldCheck className="h-3.5 w-3.5 text-[#a78bfa]" />
							Browser Permission
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("tester")}
							className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
								activeTab === "tester"
									? "bg-[#201838] text-[#c4b5fd] border border-[#8b5cf6]/40 shadow-xs"
									: "text-[#6b7898] hover:text-[#a0a8b8]"
							}`}
						>
							<Zap className="h-3.5 w-3.5 text-amber-400" />
							Test Connection
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("tunnel")}
							className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
								activeTab === "tunnel"
									? "bg-[#201838] text-[#c4b5fd] border border-[#8b5cf6]/40 shadow-xs"
									: "text-[#6b7898] hover:text-[#a0a8b8]"
							}`}
						>
							<Terminal className="h-3.5 w-3.5 text-blue-400" />
							Reverse Tunnel
						</button>
					</div>
				</div>

				{/* Body Content */}
				<div className="p-6 overflow-y-auto max-h-[calc(85vh-170px)] space-y-4">
					{/* TAB 1: BROWSER PERMISSION */}
					{activeTab === "permission" && (
						<div className="space-y-4">
							{/* If user is running locally */}
							{isLocalOrigin ? (
								<div className="p-4 rounded-xl bg-[#141824] border border-[#232a3d] space-y-2.5">
									<div className="flex items-center gap-2 text-emerald-400 font-semibold text-[12px]">
										<CheckCircle2 className="h-4 w-4" />
										Running in Local Environment
									</div>
									<p className="text-[11px] text-[#8b98b5] leading-relaxed">
										Because this simulator is running on{" "}
										<code className="text-[#c4b5fd] font-mono px-1 py-0.5 rounded bg-black/40 text-[10px]">
											{originUrl}
										</code>
										, your browser allows direct WebSocket
										connections to{" "}
										<code className="text-[#c4b5fd] font-mono px-1 py-0.5 rounded bg-black/40 text-[10px]">
											ws://localhost:9000
										</code>{" "}
										without needing any permission changes
										or tunnels.
									</p>
									<div className="pt-1 flex items-center gap-2">
										<button
											type="button"
											onClick={() =>
												setActiveTab("tester")
											}
											className="px-3 py-1.5 rounded-lg bg-[#22183b] border border-[#8b5cf6]/40 text-[#c4b5fd] hover:text-white hover:border-[#8b5cf6] text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5"
										>
											<Zap className="h-3 w-3 text-amber-400" />{" "}
											Test your local CSMS connection
											&rarr;
										</button>
									</div>
								</div>
							) : (
								/* When running on hosted HTTPS */
								<div className="p-3.5 rounded-xl bg-[#151426] border border-[#292342] flex items-start gap-2.5 text-[11px]">
									<Info className="h-4 w-4 text-[#a78bfa] shrink-0 mt-0.5" />
									<p className="text-[#8b98b5] leading-relaxed">
										When hosted over HTTPS, browsers block
										unencrypted WebSockets (
										<code className="text-[#c4b5fd] font-mono text-[10px]">
											ws://
										</code>
										) to localhost by default. Allow{" "}
										<strong>"Insecure content"</strong> in
										site settings to connect directly with
										zero proxy or tunnel.
									</p>
								</div>
							)}

							{/* Browser selector pills */}
							<div className="flex items-center gap-1 p-1 rounded-lg bg-[#0e1017] border border-[#202334] w-fit">
								<button
									type="button"
									onClick={() => setBrowser("chromium")}
									className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
										browser === "chromium"
											? "bg-[#22183b] text-[#c4b5fd] border border-[#8b5cf6]/40"
											: "text-[#6b7898] hover:text-white"
									}`}
								>
									<Laptop className="h-3 w-3" />
									Chrome / Edge / Brave
								</button>
								<button
									type="button"
									onClick={() => setBrowser("firefox")}
									className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
										browser === "firefox"
											? "bg-[#22183b] text-[#c4b5fd] border border-[#8b5cf6]/40"
											: "text-[#6b7898] hover:text-white"
									}`}
								>
									Firefox
								</button>
								<button
									type="button"
									onClick={() => setBrowser("safari")}
									className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
										browser === "safari"
											? "bg-[#22183b] text-[#c4b5fd] border border-[#8b5cf6]/40"
											: "text-[#6b7898] hover:text-white"
									}`}
								>
									Safari
								</button>
							</div>

							{/* CHROMIUM INSTRUCTIONS */}
							{browser === "chromium" && (
								<div className="space-y-3">
									<div className="rounded-xl border border-[#222538] bg-[#0e1017] p-4 space-y-3 text-[11px]">
										{/* Step 1 */}
										<div className="flex items-start gap-3">
											<div className="h-5 w-5 rounded-full bg-[#1e1535] border border-[#8b5cf6]/40 text-[#c4b5fd] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
												1
											</div>
											<div className="space-y-1">
												<p className="font-semibold text-white">
													Click the Page Settings icon
													in the address bar
												</p>
												<p className="text-[10px] text-[#7d8ba7] leading-relaxed">
													In your browser address bar
													at the top, click the{" "}
													<strong>Tune (🎛️)</strong>{" "}
													or{" "}
													<strong>
														Padlock (🔒)
													</strong>{" "}
													icon next to the URL &rarr;
													click{" "}
													<strong>
														Site settings
													</strong>
													.
												</p>
											</div>
										</div>

										{/* Step 2 */}
										<div className="flex items-start gap-3">
											<div className="h-5 w-5 rounded-full bg-[#1e1535] border border-[#8b5cf6]/40 text-[#c4b5fd] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
												2
											</div>
											<div className="space-y-1">
												<p className="font-semibold text-white">
													Set "Insecure content" to
													Allow
												</p>
												<p className="text-[10px] text-[#7d8ba7] leading-relaxed">
													Scroll down to{" "}
													<strong>
														Insecure content
													</strong>{" "}
													and change the dropdown from{" "}
													<em>Block</em> to{" "}
													<strong className="text-emerald-400">
														Allow
													</strong>
													.
													<em>
														{" "}
														(If "Local network
														access" is listed,
														ensure it is also set to
														Allow).
													</em>
												</p>
											</div>
										</div>

										{/* Step 3 */}
										<div className="flex items-start gap-3">
											<div className="h-5 w-5 rounded-full bg-[#1e1535] border border-[#8b5cf6]/40 text-[#c4b5fd] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
												3
											</div>
											<div className="space-y-1">
												<p className="font-semibold text-white">
													Reload the page & Connect
												</p>
												<p className="text-[10px] text-[#7d8ba7] leading-relaxed">
													Switch back to this
													simulator tab, refresh, and
													click{" "}
													<strong>Connect</strong>.
													Direct connections to{" "}
													<code className="text-[#a78bfa] font-mono">
														ws://localhost:9000
													</code>{" "}
													will now work!
												</p>
											</div>
										</div>
									</div>

									{/* Chrome 142 Prompt note */}
									<div className="p-3 rounded-xl bg-[#0e1017] border border-[#222538] flex items-center justify-between text-[11px]">
										<div className="space-y-0.5">
											<span className="font-semibold text-white flex items-center gap-1.5">
												<Zap className="h-3 w-3 text-amber-400" />
												Chrome 142+ Permission Prompt
											</span>
											<p className="text-[10px] text-[#7d8ba7]">
												If Chrome displays a prompt
												asking to connect to local
												devices, click{" "}
												<strong>Allow</strong>.
											</p>
										</div>
										<span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30 text-[9px] shrink-0">
											Auto-prompt
										</span>
									</div>
								</div>
							)}

							{/* FIREFOX INSTRUCTIONS */}
							{browser === "firefox" && (
								<div className="p-4 rounded-xl border border-[#222538] bg-[#0e1017] space-y-3 text-[11px]">
									<p className="font-semibold text-white text-[12px]">
										Firefox Configuration
									</p>
									<ol className="list-decimal list-inside space-y-2 text-[#8b98b5]">
										<li>
											Open a new tab and go to:
											<span className="inline-flex items-center gap-1 bg-[#161826] border border-[#262a3d] rounded px-2 py-0.5 text-[10px] font-mono text-[#a78bfa] ml-1.5">
												about:config
												<CopyButton text="about:config" />
											</span>
										</li>
										<li>
											Click{" "}
											<strong>
												Accept the Risk and Continue
											</strong>
											.
										</li>
										<li>
											Search for:
											<div className="mt-1 flex items-center gap-1 bg-[#161826] border border-[#262a3d] rounded px-2 py-1 text-[10px] font-mono text-[#a78bfa] w-fit">
												<code>
													network.websocket.allowInsecureFromHTTPS
												</code>
												<CopyButton text="network.websocket.allowInsecureFromHTTPS" />
											</div>
										</li>
										<li>
											Toggle value to{" "}
											<strong className="text-emerald-400">
												true
											</strong>{" "}
											and reload simulator.
										</li>
									</ol>
								</div>
							)}

							{/* SAFARI INSTRUCTIONS */}
							{browser === "safari" && (
								<div className="p-4 rounded-xl border border-[#222538] bg-[#0e1017] space-y-2.5 text-[11px]">
									<p className="font-semibold text-white text-[12px]">
										Safari Configuration
									</p>
									<ol className="list-decimal list-inside space-y-1.5 text-[#8b98b5]">
										<li>
											Go to{" "}
											<strong>Safari Settings</strong>{" "}
											&gt; <strong>Advanced</strong> &gt;
											Check{" "}
											<strong>
												"Show features for web
												developers"
											</strong>
											.
										</li>
										<li>
											Under the <strong>Develop</strong>{" "}
											menu, disable local cross-origin
											restrictions.
										</li>
										<li>
											Or run the simulator locally using{" "}
											<code className="text-[#a78bfa] font-mono">
												npm run dev
											</code>{" "}
											for zero restrictions.
										</li>
									</ol>
								</div>
							)}
						</div>
					)}

					{/* TAB 2: TEST CONNECTION */}
					{activeTab === "tester" && (
						<div className="space-y-4">
							<div className="p-4 rounded-xl bg-[#0e1017] border border-[#222538] space-y-3.5">
								<div className="flex items-center justify-between">
									<span className="text-[12px] font-bold text-white flex items-center gap-2">
										<Server className="h-4 w-4 text-amber-400" />
										Test Local CSMS Reachability
									</span>
									<span className="text-[10px] text-[#7d8ba7] truncate max-w-[200px]">
										Active:{" "}
										<code className="text-[#c4b5fd] font-mono">
											{config.endpoint}
										</code>
									</span>
								</div>

								{/* Port Input & Chips */}
								<div className="space-y-2">
									<label
										htmlFor="test-port-input"
										className="text-[10px] font-semibold text-[#6b7898] uppercase tracking-wider block"
									>
										Target Port
									</label>
									<div className="flex flex-wrap items-center gap-2">
										<div className="flex items-center gap-1.5 bg-[#141624] border border-[#25283c] rounded-lg px-3 py-1.5 flex-1 min-w-[180px]">
											<span className="text-[11px] font-mono text-[#6b7898]">
												ws://localhost:
											</span>
											<input
												id="test-port-input"
												type="text"
												value={testPort}
												onChange={(e) =>
													setTestPort(e.target.value)
												}
												placeholder="9000"
												className="bg-transparent text-white font-mono text-[11px] flex-1 outline-none"
											/>
										</div>

										{[
											"9000",
											"8080",
											"8180",
											"3000",
											"8887",
										].map((p) => (
											<button
												key={p}
												type="button"
												onClick={() => {
													setTestPort(p);
													runTestConnection(p);
												}}
												className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono border transition-all cursor-pointer ${
													testPort === p
														? "bg-[#8b5cf6]/20 border-[#8b5cf6] text-[#c4b5fd]"
														: "bg-[#141624] border-[#25283a] text-[#7d8ba7] hover:text-white"
												}`}
											>
												:{p}
											</button>
										))}
									</div>
								</div>

								{/* Actions */}
								<div className="flex flex-wrap items-center gap-2 pt-1">
									<button
										type="button"
										disabled={testStatus === "testing"}
										onClick={() =>
											runTestConnection(testPort)
										}
										className="h-8 px-4 rounded-lg bg-linear-to-r from-[#7C3AED] to-[#9333ea] text-white text-[11px] font-bold flex items-center gap-2 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 shadow-[0_0_12px_rgba(124,58,237,0.3)]"
									>
										{testStatus === "testing" ? (
											<>
												<RefreshCw className="h-3 w-3 animate-spin" />
												Testing…
											</>
										) : (
											<>
												<Play className="h-3 w-3" />
												Test WebSocket
											</>
										)}
									</button>

									<button
										type="button"
										onClick={() => {
											updateConfig({
												endpoint: `ws://localhost:${testPort.trim() || "9000"}`,
											});
											setApplied(true);
											setTimeout(
												() => setApplied(false),
												2000,
											);
										}}
										className={`h-8 px-3 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
											applied
												? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
												: "bg-[#141624] border-[#25283a] text-[#a0a8b8] hover:text-white"
										}`}
									>
										{applied ? (
											<>
												<Check className="h-3 w-3 text-emerald-400" />
												Applied to Active Charger!
											</>
										) : (
											<>
												Apply ws://localhost:
												{testPort || "9000"}
											</>
										)}
									</button>
								</div>

								{/* Test Result */}
								{testStatus !== "idle" && (
									<div
										className={`mt-2 p-3 rounded-xl border text-[11px] transition-all ${
											testStatus === "testing"
												? "bg-[#151928] border-[#252b42] text-[#8b98b5]"
												: testStatus === "success"
													? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
													: testStatus === "blocked"
														? "bg-amber-950/40 border-amber-500/40 text-amber-200"
														: "bg-rose-950/40 border-rose-500/40 text-rose-200"
										}`}
									>
										<div className="flex items-start gap-2">
											{testStatus === "testing" && (
												<RefreshCw className="h-4 w-4 animate-spin text-blue-400 shrink-0 mt-0.5" />
											)}
											{testStatus === "success" && (
												<CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
											)}
											{testStatus === "blocked" && (
												<AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
											)}
											{testStatus === "error" && (
												<ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
											)}

											<div className="space-y-1 flex-1">
												<div className="flex items-center justify-between">
													<span className="font-bold">
														{testStatus ===
														"testing"
															? "Testing connection…"
															: testStatus ===
																  "success"
																? "Connected Successfully!"
																: testStatus ===
																	  "blocked"
																	? "Blocked by Browser Security"
																	: "Connection Refused / Closed"}
													</span>
													{testLatency !== null && (
														<span className="font-mono text-[10px] opacity-75">
															{testLatency} ms
														</span>
													)}
												</div>
												<p className="text-[10px] opacity-90 leading-relaxed">
													{testMessage}
												</p>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					)}

					{/* TAB 3: REVERSE TUNNEL */}
					{activeTab === "tunnel" && (
						<div className="space-y-3 text-[11px]">
							<div className="p-3.5 rounded-xl bg-[#0e1017] border border-[#222538] space-y-1 text-[#7d8ba7]">
								<p className="font-semibold text-white text-[11px] flex items-center gap-1.5">
									<Terminal className="h-3.5 w-3.5 text-blue-400" />
									When to use a Reverse Tunnel
								</p>
								<p className="text-[10px] leading-relaxed">
									Use this if your computer is on a restricted
									corporate network where browser site
									permissions cannot be changed.
								</p>
							</div>

							{/* Steps */}
							<div className="space-y-2.5">
								{[
									{
										num: "1",
										title: "Install Ngrok",
										command: "npm install -g ngrok",
										desc: "Install Ngrok globally or download from ngrok.com",
									},
									{
										num: "2",
										title: "Start your CSMS server",
										command: "node server.js",
										desc: "Make sure your CSMS is running locally on port 9000",
									},
									{
										num: "3",
										title: "Create tunnel",
										command: "ngrok http 9000",
										desc: "Ngrok will provide a public forwarding address",
									},
									{
										num: "4",
										title: "Use secure wss:// URL",
										command: "wss://xxxx-xx.ngrok-free.app",
										desc: "Copy the HTTPS forwarding address and replace https:// with wss://",
									},
								].map((step) => (
									<div
										key={step.num}
										className="flex gap-3 p-3 rounded-xl bg-[#0e1017] border border-[#1f2233]"
									>
										<div className="h-5 w-5 rounded-full bg-[#1e1535] border border-[#8b5cf6]/40 flex items-center justify-center text-[10px] font-bold text-[#c4b5fd] shrink-0 mt-0.5">
											{step.num}
										</div>
										<div className="flex-1 space-y-1">
											<div className="flex items-center justify-between">
												<span className="font-semibold text-white text-[11px]">
													{step.title}
												</span>
												<span className="text-[10px] text-[#7d8ba7]">
													{step.desc}
												</span>
											</div>
											<div className="flex items-center gap-1.5 bg-[#141624] border border-[#25283a] rounded-md px-2.5 py-1">
												<code className="flex-1 text-[10px] font-mono text-[#a78bfa] truncate">
													{step.command}
												</code>
												<CopyButton
													text={step.command}
												/>
											</div>
										</div>
									</div>
								))}
							</div>

							{/* Cloudflare Tunnel alternative */}
							<div className="p-3 rounded-xl bg-[#0e1017] border border-[#1f2233] space-y-1.5">
								<span className="font-semibold text-white text-[10px]">
									Cloudflare Tunnel (Alternative)
								</span>
								<div className="flex items-center gap-1.5 bg-[#141624] border border-[#25283a] rounded-md px-2.5 py-1">
									<code className="flex-1 text-[10px] font-mono text-[#a78bfa] truncate">
										cloudflared tunnel --url
										http://localhost:9000
									</code>
									<CopyButton text="cloudflared tunnel --url http://localhost:9000" />
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="px-6 py-3 border-t border-[#1f2233] bg-[#141622] flex items-center justify-between text-[11px]">
					<span className="text-[#6b7898] text-[10px] flex items-center gap-1 min-w-0">
						<Info className="h-3 w-3 shrink-0" />
						<span className="shrink-0">CSMS URL:</span>
						<span className="font-mono text-white truncate max-w-[240px]">
							{config.endpoint}
						</span>
					</span>
					<a
						href="https://developer.chrome.com/blog/local-network-access"
						target="_blank"
						rel="noopener noreferrer"
						className="text-[10px] text-[#8b5cf6] hover:text-[#c4b5fd] flex items-center gap-1 transition-colors shrink-0"
					>
						Chrome LNA Docs
						<ExternalLink className="h-2.5 w-2.5" />
					</a>
				</div>
			</DialogContent>
		</Dialog>
	);
}
