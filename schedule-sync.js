import { supabase } from "./supabase.js";

export const connectScheduleSync = async ({ onState, onConnectionStatus }) => {
    const channel = supabase
        .channel("schedule-state-sync")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "schedule_state" },
            (payload) => onState(payload.eventType === "DELETE" ? null : payload.new)
        );

    let subscriptionTimeout;
    await Promise.race([
        new Promise((resolve) => {
            channel.subscribe((status, error) => {
                onConnectionStatus?.(status, error);
                if (["SUBSCRIBED", "CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status)) {
                    resolve(status);
                }
            });
        }),
        new Promise((resolve) => {
            subscriptionTimeout = window.setTimeout(() => resolve("TIMED_OUT"), 8000);
        })
    ]);
    window.clearTimeout(subscriptionTimeout);

    const { data, error } = await supabase
        .from("schedule_state")
        .select("schedule, week_number, announcement, updated_at")
        .eq("singleton", true)
        .maybeSingle();
    if (error) {
        await supabase.removeChannel(channel);
        throw error;
    }

    return {
        initialState: data,
        async saveSchedule(schedule, weekNumber) {
            const { data: savedState, error: saveError } = await supabase.rpc("save_schedule", {
                p_schedule: schedule,
                p_week_number: weekNumber
            });
            if (saveError) {
                throw saveError;
            }
            return Array.isArray(savedState) ? savedState[0] : savedState;
        },
        async publishAnnouncement(message) {
            const { data: savedState, error: announcementError } = await supabase.rpc("publish_announcement", {
                p_message: message
            });
            if (announcementError) {
                throw announcementError;
            }
            return Array.isArray(savedState) ? savedState[0] : savedState;
        },
        async getCurrentState() {
            const { data: currentState, error: readError } = await supabase
                .from("schedule_state")
                .select("schedule, week_number, announcement, updated_at")
                .eq("singleton", true)
                .maybeSingle();
            if (readError) {
                throw readError;
            }
            return currentState;
        },
        async disconnect() {
            await supabase.removeChannel(channel);
        }
    };
};
