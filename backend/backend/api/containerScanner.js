/**
 *
 * Copyright HackerBay, Inc.
 *
 */
const express = require('express');
const router = express.Router();
const ContainerSecurityService = require('../services/containerSecurityService');
const ContainerSecurityLogService = require('../services//containerSecurityLogService');
const isAuthorizedContainerScanner = require('../middlewares/containerScannerAuthorization')
    .isAuthorizedContainerScanner;
const sendErrorResponse = require('../middlewares/response').sendErrorResponse;
const sendItemResponse = require('../middlewares/response').sendItemResponse;

router.get('/containerSecurities', isAuthorizedContainerScanner, async function(
    req,
    res
) {
    try {
        const response = await ContainerSecurityService.getSecuritiesToScan();
        return sendItemResponse(req, res, response);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});
router.post('/scanning', isAuthorizedContainerScanner, async function(
    req,
    res
) {
    try {
        const security = req.body.security;
        const containerSecurity = await ContainerSecurityService.updateOneBy(
            {
                _id: security._id,
            },
            { scanning: true }
        );
        global.io.emit(`security_${containerSecurity._id}`, containerSecurity);
        return sendItemResponse(req, res, containerSecurity);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.post('/failed', isAuthorizedContainerScanner, async function(req, res) {
    try {
        const security = req.body;
        const containerSecurity = await ContainerSecurityService.updateOneBy(
            {
                _id: security._id,
            },
            { scanning: false }
        );
        return sendItemResponse(req, res, containerSecurity);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});
router.post('/log', isAuthorizedContainerScanner, async function(req, res) {
    try {
        const security = req.body;
        const securityLog = await ContainerSecurityLogService.create({
            securityId: security.securityId,
            componentId: security.componentId,
            data: security.data,
        });

        const findLog = await ContainerSecurityLogService.findOneBy(
            securityLog._id
        );
        global.io.emit(`securityLog_${security.securityId}`, findLog);

        return sendItemResponse(req, res, findLog);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.post('/time', isAuthorizedContainerScanner, async function(req, res) {
    try {
        const security = req.body;
        const updatedTime = await ContainerSecurityService.updateScanTime({
            _id: security._id,
        });
        return sendItemResponse(req, res, updatedTime);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

module.exports = router;
