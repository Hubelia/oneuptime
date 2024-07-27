import ModelTable from "CommonUI/src/Components/ModelTable/ModelTable";
import PageMap from "../../../Utils/PageMap";
import RouteMap, { RouteUtil } from "../../../Utils/RouteMap";
import PageComponentProps from "../../PageComponentProps";
import SideMenu from "./SideMenu";
import Route from "Common/Types/API/Route";
import Page from "CommonUI/src/Components/Page/Page";
import React, { FunctionComponent, ReactElement } from "react";
import User from "CommonUI/src/Utils/User";
import UserTwoFactorAuth from "Model/Models/UserTwoFactorAuth";
import { ButtonStyleType } from "CommonUI/src/Components/Button/Button";
import IconProp from "Common/Types/Icon/IconProp";
import FieldType from "CommonUI/src/Components/Types/FieldType";
import FormFieldSchemaType from "CommonUI/src/Components/Forms/Types/FormFieldSchemaType";
import BasicFormModal from "CommonUI/src/Components/FormModal/BasicFormModal";
import QRCodeElement from "CommonUI/src/Components/QR/QR";
import { JSONObject } from "Common/Types/JSON";
import HTTPResponse from "Common/Types/API/HTTPResponse";
import EmptyResponseData from "Common/Types/API/EmptyResponse";
import HTTPErrorResponse from "Common/Types/API/HTTPErrorResponse";
import API from "CommonUI/src/Utils/API/API";
import { APP_API_URL } from "CommonUI/src/Config";
import URL from "Common/Types/API/URL";

const Home: FunctionComponent<PageComponentProps> = (): ReactElement => {


  const [selectedTwoFactorAuth, setSelectedTwoFactorAuth] = React.useState<UserTwoFactorAuth | null>(null);
  const [showVerificationModal, setShowVerificationModal] = React.useState<boolean>(false);
  const [verificationError, setVerificationError] = React.useState<string | null>(null);
  const [verificationLoading, setVerificationLoading] = React.useState<boolean>(false);

  const [tableRefreshToggle, setTableRefreshToggle] = React.useState<boolean>(false);


  return (
    <Page
      title={"User Profile"}
      breadcrumbLinks={[
        {
          title: "Home",
          to: RouteUtil.populateRouteParams(RouteMap[PageMap.HOME] as Route),
        },
        {
          title: "User Profile",
          to: RouteUtil.populateRouteParams(
            RouteMap[PageMap.USER_PROFILE_OVERVIEW] as Route,
          ),
        },
        {
          title: "Two Factor Authentication",
          to: RouteUtil.populateRouteParams(
            RouteMap[PageMap.USER_TWO_FACTOR_AUTH] as Route,
          ),
        },
      ]}
      sideMenu={<SideMenu />}
    >
      <div>
        <ModelTable<UserTwoFactorAuth>
          modelType={UserTwoFactorAuth}
          name="Two Factor Authentication"
          id="two-factor-auth-table"
          isDeleteable={true}
          refreshToggle={tableRefreshToggle}
          filters={[]}
          query={{
            userId: User.getUserId(),
          }}
          isEditable={true}
          showRefreshButton={true}
          isCreateable={true}
          isViewable={false}
          cardProps={{
            title: "Two Factor Authentication",
            description: "Manage your two factor authentication settings here.",
          }}
          noItemsMessage={"No two factor authentication found."}
          singularName="Two Factor Authentication"
          pluralName="Two Factor Authentications"
          actionButtons={[
            {
              title: "Verify",
              buttonStyleType: ButtonStyleType.NORMAL,
              icon: IconProp.Check,
              isVisible: (item: UserTwoFactorAuth) => !item.isVerified,
              onClick: async (
                item: UserTwoFactorAuth,
                onCompleteAction: VoidFunction,
              ) => {
                setSelectedTwoFactorAuth(item);
                setShowVerificationModal(true);
                onCompleteAction();
              },
            },
          ]}
          formFields={[
            {
              field: {
                name: true,
              },
              title: "Name",
              fieldType: FormFieldSchemaType.Text,
              required: true,
            },
          ]}
          selectMoreFields={{
            twoFactorOtpUrl: true,
          }}
          deleteButtonText="Reject"
          columns={[
            {
              field: {
                name: true,
              },
              title: "Name",
              type: FieldType.Text,
              selectedProperty: "name",
            },
            {
              field: {
                isVerified: true,
              },
              title: "Is Verified?",
              type: FieldType.Boolean,
            },
          ]}
        />
         {showVerificationModal && selectedTwoFactorAuth ? (
        <BasicFormModal
          title={`Verify ${selectedTwoFactorAuth.name}`}
          description={`Please scan this QR code with your authenticator app and enter the code below.`}
          
          formProps={{
            error: verificationError || undefined,
            fields: [
              {
                field: {
                  qr: true,
                },
                title: "Please scan this QR code with your authenticator app.",
                required: false, 
                getCustomElement: () => {
                  return <QRCodeElement text={selectedTwoFactorAuth.twoFactorOtpUrl || ""} />; 
                }
              },
              {
                field: {
                  code: true,
                },
                title: "Code",
                description: "Please enter the code from your authenticator app.",
                fieldType: FormFieldSchemaType.Text,
                required: true,
              },
            ],
          }}
          submitButtonText={"Validate"}
          onClose={() => {
            setShowVerificationModal(false);
            setVerificationError(null);
            setSelectedTwoFactorAuth(null);
          }}
          isLoading={verificationLoading}
          onSubmit={async (values: JSONObject) => {
            try {
              setVerificationLoading(true);
              setVerificationError("");

              // test CallSMS config
              const response:
                | HTTPResponse<EmptyResponseData>
                | HTTPErrorResponse = await API.post(
                URL.fromString(APP_API_URL.toString()).addRoute(
                  `/user-two-factor-auth/validate`,
                ),
                {
                  code: values['code'],
                  id: selectedTwoFactorAuth.id?.toString(),
                },
              );
              if (response.isSuccess()) {
                setShowVerificationModal(false);
                setVerificationError(null);
                setSelectedTwoFactorAuth(null);
                setVerificationLoading(false);
              }

              if (response instanceof HTTPErrorResponse) {
                throw response;
              }

              setTableRefreshToggle(!tableRefreshToggle);


            } catch (err) {
              setVerificationError(API.getFriendlyMessage(err));
              setVerificationLoading(false);
            }

            setVerificationLoading(false);

          }}
        />
      ) : (
        <></>
      )}


      </div>
    </Page>
  );
};

export default Home;
