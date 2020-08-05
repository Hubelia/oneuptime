import { postApi, getApi, deleteApi, putApi } from '../api';
import * as types from '../constants/scheduledEvent';

export const fetchscheduledEvent = (
    projectId,
    scheduledEventId
) => async dispatch => {
    try {
        dispatch(fetchscheduledEventRequest());

        const response = await getApi(
            `scheduledEvent/${projectId}/${scheduledEventId}`
        );
        dispatch(fetchscheduledEventSuccess(response.data));
    } catch (error) {
        const errorMsg =
            error.response && error.response.data
                ? error.response.data
                : error.data
                ? error.data
                : error.message
                ? error.message
                : 'Network Error';
        dispatch(fetchscheduledEventFailure(errorMsg));
    }
};

export function fetchscheduledEventSuccess(scheduledEvents) {
    return {
        type: types.FETCH_SCHEDULED_EVENT_SUCCESS,
        payload: scheduledEvents,
    };
}

export function fetchscheduledEventRequest() {
    return {
        type: types.FETCH_SCHEDULED_EVENT_REQUEST,
    };
}

export function fetchscheduledEventFailure(error) {
    return {
        type: types.FETCH_SCHEDULED_EVENT_FAILURE,
        payload: error,
    };
}

export const fetchscheduledEvents = (
    projectId,
    skip,
    limit
) => async dispatch => {
    skip = Number(skip);
    limit = Number(limit);
    dispatch(fetchscheduledEventsRequest());

    try {
        let response = {};
        if (!skip && !limit) {
            response = await getApi(
                `scheduledEvent/${projectId}?skip=${0}&limit=${10}`
            );
        } else {
            response = await getApi(
                `scheduledEvent/${projectId}?skip=${skip}&limit=${limit}`
            );
        }
        const { data, count } = response.data;
        dispatch(fetchscheduledEventsSuccess({ data, count, skip, limit }));
    } catch (error) {
        const errorMsg =
            error.response && error.response.data
                ? error.response.data
                : error.data
                ? error.data
                : error.message
                ? error.message
                : 'Network Error';
        dispatch(fetchscheduledEventsFailure(errorMsg));
    }
};

export function fetchscheduledEventsSuccess(scheduledEvents) {
    return {
        type: types.FETCH_SCHEDULED_EVENTS_SUCCESS,
        payload: scheduledEvents,
    };
}

export function fetchscheduledEventsRequest() {
    return {
        type: types.FETCH_SCHEDULED_EVENTS_REQUEST,
    };
}

export function fetchscheduledEventsFailure(error) {
    return {
        type: types.FETCH_SCHEDULED_EVENTS_FAILURE,
        payload: error,
    };
}

export const createScheduledEvent = (projectId, values) => async dispatch => {
    try {
        dispatch(createScheduledEventRequest());

        const response = await postApi(`scheduledEvent/${projectId}`, values);
        dispatch(createScheduledEventSuccess(response.data));
    } catch (error) {
        const errorMsg =
            error.response && error.response.data
                ? error.response.data
                : error.data
                ? error.data
                : error.message
                ? error.message
                : 'Network Error';
        dispatch(createScheduledEventFailure(errorMsg));
    }
};

export function createScheduledEventSuccess(newScheduledEvent) {
    return {
        type: types.CREATE_SCHEDULED_EVENT_SUCCESS,
        payload: newScheduledEvent,
    };
}

export function createScheduledEventRequest() {
    return {
        type: types.CREATE_SCHEDULED_EVENT_REQUEST,
    };
}

export function createScheduledEventFailure(error) {
    return {
        type: types.CREATE_SCHEDULED_EVENT_FAILURE,
        payload: error,
    };
}

export const deleteScheduledEvent = (
    projectId,
    scheduledEventId
) => async dispatch => {
    try {
        dispatch(deleteScheduledEventRequest());

        const response = await deleteApi(
            `scheduledEvent/${projectId}/${scheduledEventId}`
        );
        dispatch(deleteScheduledEventSuccess(response.data));
    } catch (error) {
        const errorMsg =
            error.response && error.response.data
                ? error.response.data
                : error.data
                ? error.data
                : error.message
                ? error.message
                : 'Network Error';
        dispatch(deleteScheduledEventFailure(errorMsg));
    }
};

export function deleteScheduledEventSuccess(payload) {
    return {
        type: types.DELETE_SCHEDULED_EVENT_SUCCESS,
        payload,
    };
}

export function deleteScheduledEventRequest() {
    return {
        type: types.DELETE_SCHEDULED_EVENT_REQUEST,
    };
}

export function deleteScheduledEventFailure(error) {
    return {
        type: types.DELETE_SCHEDULED_EVENT_FAILURE,
        payload: error,
    };
}

export const updateScheduledEvent = (
    projectId,
    scheduledEventId,
    values
) => async dispatch => {
    try {
        dispatch(updateScheduledEventRequest());

        const response = await putApi(
            `scheduledEvent/${projectId}/${scheduledEventId}`,
            values
        );
        dispatch(updateScheduledEventSuccess(response.data));
    } catch (error) {
        const errorMsg =
            error.response && error.response.data
                ? error.response.data
                : error.data
                ? error.data
                : error.message
                ? error.message
                : 'Network Error';
        dispatch(updateScheduledEventFailure(errorMsg));
    }
};

export function updateScheduledEventSuccess(updatedScheduledEvent) {
    return {
        type: types.UPDATE_SCHEDULED_EVENT_SUCCESS,
        payload: updatedScheduledEvent,
    };
}

export function updateScheduledEventRequest() {
    return {
        type: types.UPDATE_SCHEDULED_EVENT_REQUEST,
    };
}

export function updateScheduledEventFailure(error) {
    return {
        type: types.UPDATE_SCHEDULED_EVENT_FAILURE,
        payload: error,
    };
}

// Scheduled Event Note
export const fetchScheduledEventNotesInvestigationRequest = () => ({
    type: types.FETCH_SCHEDULED_EVENT_NOTES_INVESTIGATION_REQUEST,
});

export const fetchScheduledEventNotesInvestigationSuccess = payload => ({
    type: types.FETCH_SCHEDULED_EVENT_NOTES_INVESTIGATION_SUCCESS,
    payload,
});

export const fetchScheduledEventNotesInvestigationFailure = error => ({
    type: types.FETCH_SCHEDULED_EVENT_NOTES_INVESTIGATION_FAILURE,
    payload: error,
});

export const fetchScheduledEventNotesInvestigation = (
    projectId,
    scheduledEventId,
    limit,
    skip
) => async dispatch => {
    try {
        dispatch(fetchScheduledEventNotesInvestigationRequest());
        skip = Number(skip);
        limit = Number(limit);

        let response = {};
        if (skip >= 0 && limit >= 0) {
            response = await getApi(
                `scheduledEvent/${projectId}/${scheduledEventId}/notes?type=investigation&limit=${limit}&skip=${skip}`
            );
        } else {
            response = await getApi(
                `scheduledEvent/${projectId}/${scheduledEventId}/notes?type=investigation`
            );
        }

        const { data, count } = response.data;
        dispatch(
            fetchScheduledEventNotesInvestigationSuccess({
                data,
                count,
                skip,
                limit,
            })
        );
    } catch (error) {
        const errorMsg =
            error.response && error.response.data
                ? error.response.data
                : error.data
                ? error.data
                : error.message
                ? error.message
                : 'Network Error';
        dispatch(fetchScheduledEventNotesInvestigationFailure(errorMsg));
    }
};

export const fetchScheduledEventNotesInternalRequest = () => ({
    type: types.FETCH_SCHEDULED_EVENT_NOTES_INTERNAL_REQUEST,
});

export const fetchScheduledEventNotesInternalSuccess = payload => ({
    type: types.FETCH_SCHEDULED_EVENT_NOTES_INTERNAL_SUCCESS,
    payload,
});

export const fetchScheduledEventNotesInternalFailure = error => ({
    type: types.FETCH_SCHEDULED_EVENT_NOTES_INTERNAL_FAILURE,
    payload: error,
});

export const fetchScheduledEventNotesInternal = (
    projectId,
    scheduledEventId,
    limit,
    skip
) => async dispatch => {
    try {
        dispatch(fetchScheduledEventNotesInternalRequest());
        skip = Number(skip);
        limit = Number(limit);

        let response = {};
        if (skip >= 0 && limit >= 0) {
            response = await getApi(
                `scheduledEvent/${projectId}/${scheduledEventId}/notes?type=internal&limit=${limit}&skip=${skip}`
            );
        } else {
            response = await getApi(
                `scheduledEvent/${projectId}/${scheduledEventId}/notes?type=internal`
            );
        }

        const { data, count } = response.data;
        dispatch(
            fetchScheduledEventNotesInternalSuccess({
                data,
                count,
                skip,
                limit,
            })
        );
    } catch (error) {
        const errorMsg =
            error.response && error.response.data
                ? error.response.data
                : error.data
                ? error.data
                : error.message
                ? error.message
                : 'Network Error';
        dispatch(fetchScheduledEventNotesInternalFailure(errorMsg));
    }
};

export const createScheduledEventNoteRequest = () => ({
    type: types.CREATE_SCHEDULED_EVENT_NOTE_REQUEST,
});

export const createScheduledEventNoteSuccess = payload => ({
    type: types.CREATE_SCHEDULED_EVENT_NOTE_SUCCESS,
    payload,
});

export const createScheduledEventNoteFailure = error => ({
    type: types.CREATE_SCHEDULED_EVENT_NOTE_FAILURE,
    payload: error,
});

export const createScheduledEventNote = (
    projectId,
    scheduledEventId,
    data
) => async dispatch => {
    try {
        dispatch(createScheduledEventNoteRequest());

        const response = await postApi(
            `scheduledEvent/${projectId}/${scheduledEventId}/notes`,
            data
        );

        dispatch(createScheduledEventNoteSuccess(response.data));
    } catch (error) {
        const errorMsg =
            error.response && error.response.data
                ? error.response.data
                : error.data
                ? error.data
                : error.message
                ? error.message
                : 'Network Error';
        dispatch(createScheduledEventNoteFailure(errorMsg));
    }
};

export const updateScheduledEventNoteInternalRequest = () => ({
    type: types.UPDATE_SCHEDULED_EVENT_NOTE_INTERNAL_REQUEST,
});

export const updateScheduledEventNoteInternalSuccess = payload => ({
    type: types.UPDATE_SCHEDULED_EVENT_NOTE_INTERNAL_SUCCESS,
    payload,
});

export const updateScheduledEventNoteInternalFailure = error => ({
    type: types.UPDATE_SCHEDULED_EVENT_NOTE_INTERNAL_FAILURE,
    paylod: error,
});

export const updateScheduledEventNoteInternal = (
    projectId,
    scheduledEventId,
    scheduledEventNoteId,
    data
) => async dispatch => {
    try {
        dispatch(updateScheduledEventNoteInternalRequest());

        const response = await putApi(
            `scheduledEvent/${projectId}/${scheduledEventId}/notes/${scheduledEventNoteId}`,
            data
        );

        dispatch(updateScheduledEventNoteInternalSuccess(response.data));
    } catch (error) {
        const errorMsg =
            error.response && error.response.data
                ? error.response.data
                : error.data
                ? error.data
                : error.message
                ? error.message
                : 'Network Error';
        dispatch(updateScheduledEventNoteInternalFailure(errorMsg));
    }
};

export const updateScheduledEventNoteInvestigationRequest = () => ({
    type: types.UPDATE_SCHEDULED_EVENT_NOTE_INVESTIGATION_REQUEST,
});

export const updateScheduledEventNoteInvestigationSuccess = payload => ({
    type: types.UPDATE_SCHEDULED_EVENT_NOTE_INVESTIGATION_SUCCESS,
    payload,
});

export const updateScheduledEventNoteInvestigationFailure = error => ({
    type: types.UPDATE_SCHEDULED_EVENT_NOTE_INVESTIGATION_FAILURE,
    paylod: error,
});

export const updateScheduledEventNoteInvestigation = (
    projectId,
    scheduledEventId,
    scheduledEventNoteId,
    data
) => async dispatch => {
    try {
        dispatch(updateScheduledEventNoteInvestigationRequest());

        const response = await putApi(
            `scheduledEvent/${projectId}/${scheduledEventId}/notes/${scheduledEventNoteId}`,
            data
        );

        dispatch(updateScheduledEventNoteInvestigationSuccess(response.data));
    } catch (error) {
        const errorMsg =
            error.response && error.response.data
                ? error.response.data
                : error.data
                ? error.data
                : error.message
                ? error.message
                : 'Network Error';
        dispatch(updateScheduledEventNoteInvestigationFailure(errorMsg));
    }
};

export const deleteScheduledEventNoteRequest = () => ({
    type: types.DELETE_SCHEDULED_EVENT_NOTE_REQUEST,
});

export const deleteScheduledEventNoteSuccess = payload => ({
    type: types.DELETE_SCHEDULED_EVENT_NOTE_SUCCESS,
    payload,
});

export const deleteScheduledEventNoteFailure = error => ({
    type: types.DELETE_SCHEDULED_EVENT_NOTE_FAILURE,
    payload: error,
});

export const deleteScheduledEventNote = (
    projectId,
    scheduledEventId,
    scheduledEventNoteId
) => async dispatch => {
    try {
        dispatch(deleteScheduledEventNoteRequest());

        const response = await deleteApi(
            `scheduledEvent/${projectId}/${scheduledEventId}/notes/${scheduledEventNoteId}`
        );
        dispatch(deleteScheduledEventNoteSuccess(response.data));
    } catch (error) {
        const errorMsg =
            error.response && error.response.data
                ? error.response.data
                : error.data
                ? error.data
                : error.message
                ? error.message
                : 'Network Error';
        dispatch(deleteScheduledEventNoteFailure(errorMsg));
    }
};
