import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Precompile } from "../../modules/precompile/index.js";
import { Helmet } from "../_base/helmet.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export const BaseLevel = () => (
	<div class="col s12">
		<div class="card">
			<div class="card-content">
				<div class="row">
					<div class="col s3 input-field no-margin">
						<input
							id="level_start"
							type="number"
						/>
						<label
							class="active"
							for="level_start">
							Start Level
						</label>
					</div>
					<div class="col s3 input-field no-margin">
						<input
							id="level_end"
							type="number"
						/>
						<label
							class="active"
							for="level_end">
							End Level
						</label>
					</div>
					<div class="col s3 input-field no-margin">
						<input
							id="level_exp_bonus"
							type="number"
						/>
						<label
							class="active"
							for="level_exp_bonus">
							Exp Bonus %
						</label>
					</div>
					<div
						class="col s3 btn disabled waves-effect waves-light"
						id="levelBtn">
						Query
					</div>
				</div>
				<div class="row">
					<div class="col s5">
						<label for="level_filter">Filter by</label>
						<select
							id="level_filter"
							class="browser-default grey darken-4">
							<option
								value=""
								selected>
								Any
							</option>
							<option value="-b">Boss (Any)</option>
							<option value="-u">Boss - Ultimate</option>
							<option value="-nm">Boss - Nightmare</option>
							<option value="-h">Boss - Hard</option>
							<option value="-n">Boss - Normal</option>
							<option value="-m">Miniboss</option>
							<option value="-M">Normal monster</option>
						</select>
					</div>
					<div class="col s4">
						<label for="level_preserve">Preserve</label>
						<select
							id="level_preserve"
							class="browser-default grey darken-4">
							<option
								value=""
								selected>
								None
							</option>
							<option value="-pr 2">Top 2</option>
							<option value="-pr 3">Top 3</option>
							<option value="-pr 4">Top 4</option>
							<option value="-pr 5">Top 5</option>
							<option value="-pr 6">Top 6</option>
							<option value="-pr 7">Top 7</option>
						</select>
					</div>
					<div class="col s3">
						<label for="level_include_events">Include Events</label>
						<select
							id="level_include_events"
							class="browser-default grey darken-4">
							<option
								value=""
								selected>
								No
							</option>
							<option value="-ev">Yes</option>
						</select>
					</div>
				</div>
				<div class="progress light-blue">
					<div class="indeterminate light-blue darken-4" />
				</div>
				<div id="scrollHidden">
					<div id="levelGuide">
						<ul class="collapsible">
							<li class="hidden">
								<div class="collapsible-header hoverable">
									<div class="col s6">
										<b class="p_level_header">Level %1 - %2</b>
									</div>
									<div class="col s6 right-align">
										<b class="p_level_header">+%3%</b>
									</div>
								</div>
								<div class="collapsible-body">
									<ul class="collapsible">
										<li class="p_level_boss_wrap">
											<div class="collapsible-header hoverable">
												<b>Boss</b>
											</div>
											<div class="collapsible-body">
												<table class="striped no-padding">
													<tbody class="p_level_boss">
														<tr>
															<td>
																<b>Name</b>
															</td>
															<td>
																<b>Type</b>
															</td>
															<td>
																<b>Level</b>
															</td>
															<td>
																<b>Count</b>
															</td>
														</tr>
													</tbody>
												</table>
											</div>
										</li>
										<li class="p_level_mini_wrap">
											<div class="collapsible-header hoverable">
												<b>Miniboss</b>
											</div>
											<div class="collapsible-body">
												<table class="striped no-padding">
													<tbody class="p_level_mini">
														<tr>
															<td>
																<b>Name</b>
															</td>
															<td>
																<b>Type</b>
															</td>
															<td>
																<b>Level</b>
															</td>
															<td>
																<b>Count</b>
															</td>
														</tr>
													</tbody>
												</table>
											</div>
										</li>
										<li class="p_level_norm_wrap">
											<div class="collapsible-header hoverable">
												<b>Normal monster</b>
											</div>
											<div class="collapsible-body">
												<table class="striped no-padding">
													<tbody class="p_level_norm">
														<tr>
															<td>
																<b>Name</b>
															</td>
															<td>
																<b>Type</b>
															</td>
															<td>
																<b>Level</b>
															</td>
															<td>
																<b>Count</b>
															</td>
														</tr>
													</tbody>
												</table>
											</div>
										</li>
									</ul>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
		<div class="card">
			<div class="card-content">
				<span class="card-title">Note</span>
				<p>
					These results are based purely on numbers, this does not guarentee you to get a party at the
					corresponding boss location.
				</p>
				<br />
				<p>
					Exp bonus is calculated by <b>stacking every 30-level milestone emblem bonuses</b> (assuming that
					the player has it), sum with <b>50%</b> from daily bonuses. Any value in <b>"Exp Bonus %"</b> box
					will override the daily bonus exp.
				</p>
				<br />
				<p>
					The <b>count</b> column indicates the amount of battle/monster to defeat between{" "}
					<b>with and without Exp bonuses applied</b>
				</p>
			</div>
		</div>
		<style>{Precompile.sass(join(__dirname, "./_static/css/base.scss"))}</style>
		<Helmet.scripts.Push>{Precompile.typescript(join(__dirname, "./_static/js/base.ts"))}</Helmet.scripts.Push>
	</div>
);
